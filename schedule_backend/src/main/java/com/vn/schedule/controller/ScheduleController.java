package com.vn.schedule.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.vn.schedule.domain.*;
import com.vn.schedule.dto.*;
import com.vn.schedule.repository.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import com.vn.schedule.util.anotation.ApiMessage;

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
    @ApiMessage("Lấy dữ liệu")
    public ResponseEntity<List<ScheduleResponse>> periods(@RequestParam(required = false) Integer storeId) {
        return ResponseEntity.ok(responses(storeId == null ? periods.findAll() : periods.findByStoreIdOrderByStartDateDesc(storeId)));
    }

    @GetMapping("/shifts")
    @ApiMessage("Lấy danh sách dữ liệu")
    public ResponseEntity<List<ScheduleResponse>> shifts(@RequestParam Integer storeId) {
        return ResponseEntity.ok(responses(shifts.findByStoreIdAndStatusOrderByStartTime(storeId, "ACTIVE")));
    }

    @GetMapping("/calendar")
    @ApiMessage("Lấy danh sách dữ liệu")
    public ResponseEntity<List<ScheduleResponse>> calendar(@RequestParam LocalDate from, @RequestParam LocalDate to) {
        if (to.isBefore(from) || from.plusMonths(3).isBefore(to)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Date range must be valid and no longer than 3 months");
        }
        return ResponseEntity.ok(responses(shiftDates.findByWorkDateBetweenOrderByWorkDateAscStartTimeAsc(from, to)));
    }

    @GetMapping("/assignments")
    @ApiMessage("Lấy dữ liệu")
    public ResponseEntity<List<ScheduleResponse>> assignments(@RequestParam(required = false) Integer employeeId,
            @RequestParam(required = false) Integer shiftByDateId) {
        if (employeeId != null)
            return ResponseEntity.ok(responses(assignments.findByEmployeeIdOrderByRegisteredAtDesc(employeeId)));
        if (shiftByDateId != null)
            return ResponseEntity.ok(responses(assignments.findByShiftByDateId(shiftByDateId)));
        return ResponseEntity.ok(responses(assignments.findAll()));
    }

    @PostMapping("/assignments")
    @Transactional

    @ApiMessage("Tạo mới dữ liệu")
    public ResponseEntity<ScheduleResponse> register(@RequestBody AssignmentRequest request) {
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
        return ResponseEntity.status(HttpStatus.CREATED).body(response(assignments.save(assignment)));
    }

    private List<ScheduleResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(ScheduleResponse::new).toList();
    }

    private ScheduleResponse response(Object value) {
        return new ScheduleResponse(DtoMapper.toMap(value));
    }
}
