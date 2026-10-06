package com.vn.shopping.controller;

import com.vn.shopping.domain.*;
import com.vn.shopping.dto.DtoMapper;
import com.vn.shopping.dto.AssignmentRequest;
import com.vn.shopping.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/schedule")
public class ScheduleController {
    private final SchedulePeriodRepository periods;
    private final ShiftRepository shifts;
    private final ShiftByDateRepository shiftDates;
    private final ShiftAssignmentRepository assignments;
    private final EmployeeRepository employees;

    public ScheduleController(SchedulePeriodRepository periods, ShiftRepository shifts,
                               ShiftByDateRepository shiftDates, ShiftAssignmentRepository assignments,
                               EmployeeRepository employees) {
        this.periods = periods;
        this.shifts = shifts;
        this.shiftDates = shiftDates;
        this.assignments = assignments;
        this.employees = employees;
    }

    @GetMapping("/periods")
    public List<Map<String, Object>> periods(@RequestParam(required = false) Integer storeId) {
        return DtoMapper.toList(storeId == null ? periods.findAll() : periods.findByStoreIdOrderByStartDateDesc(storeId));
    }

    @GetMapping("/shifts")
    public List<Map<String, Object>> shifts(@RequestParam Integer storeId) {
        return DtoMapper.toList(shifts.findByStoreIdAndStatusOrderByStartTime(storeId, "ACTIVE"));
    }

    @GetMapping("/calendar")
    public List<Map<String, Object>> calendar(@RequestParam LocalDate from, @RequestParam LocalDate to) {
        if (to.isBefore(from) || from.plusMonths(3).isBefore(to)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Date range must be valid and no longer than 3 months");
        }
        return DtoMapper.toList(shiftDates.findByWorkDateBetweenOrderByWorkDateAscStartTimeAsc(from, to));
    }

    @GetMapping("/assignments")
    public List<Map<String, Object>> assignments(@RequestParam(required = false) Integer employeeId,
                                             @RequestParam(required = false) Integer shiftByDateId) {
        if (employeeId != null) return DtoMapper.toList(assignments.findByEmployeeIdOrderByRegisteredAtDesc(employeeId));
        if (shiftByDateId != null) return DtoMapper.toList(assignments.findByShiftByDateId(shiftByDateId));
        return DtoMapper.toList(assignments.findAll());
    }

    @PostMapping("/assignments")
    @Transactional
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> register(@RequestBody AssignmentRequest request) {
        ShiftByDate shift = shiftDates.findById(request.shiftByDateId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shift not found"));
        Employee employee = employees.findById(request.employeeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found"));
        if (!"OPEN".equalsIgnoreCase(shift.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Shift is not open for registration");
        }
        if (assignments.findByShiftByDateId(shift.getId()).stream()
                .anyMatch(item -> item.getEmployee().getId().equals(employee.getId()))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Employee has already registered for this shift");
        }
        long approved = assignments.findByShiftByDateId(shift.getId()).stream()
                .filter(item -> "APPROVED".equalsIgnoreCase(item.getStatus())).count();
        int capacity = shift.getCapacity() != null ? shift.getCapacity() : shift.getMaxCapacity();
        if (capacity > 0 && approved >= capacity) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Shift capacity has been reached");
        }
        ShiftAssignment assignment = new ShiftAssignment();
        assignment.setShiftByDate(shift);
        assignment.setEmployee(employee);
        assignment.setStatus("PENDING");
        assignment.setRegisteredAt(LocalDateTime.now());
        return DtoMapper.toMap(assignments.save(assignment));
    }

}
