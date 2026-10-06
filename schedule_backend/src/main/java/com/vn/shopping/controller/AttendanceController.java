package com.vn.shopping.controller;

import com.vn.shopping.domain.Attendance;
import com.vn.shopping.dto.AttendanceRequest;
import com.vn.shopping.dto.CheckInRequest;
import com.vn.shopping.dto.DtoMapper;
import com.vn.shopping.repository.AttendanceRepository;
import com.vn.shopping.repository.EmployeeRepository;
import com.vn.shopping.util.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/attendance")
public class AttendanceController {
    private final AttendanceRepository attendance;
    private final EmployeeRepository employees;

    public AttendanceController(AttendanceRepository attendance, EmployeeRepository employees) {
        this.attendance = attendance;
        this.employees = employees;
    }

    @GetMapping
    public List<Map<String, Object>> list(@RequestParam(required = false) Integer employeeId) {
        return DtoMapper.toList(employeeId == null ? attendance.findAll() : attendance.findByEmployeeIdOrderByCheckInAtDesc(employeeId));
    }

    @PostMapping("/check-in")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> checkIn(@RequestBody CheckInRequest request) {
        Attendance item = new Attendance();
        item.setEmployee(employees.findById(request.employeeId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Employee not found")));
        item.setCheckInAt(LocalDateTime.now());
        item.setCheckInLatitude(request.latitude());
        item.setCheckInLongitude(request.longitude());
        item.setAttendanceStatus("PRESENT");
        item.setScheduleMatchStatus("PENDING");
        item.setApprovalStatus("PENDING");
        item.setCreatedAt(LocalDateTime.now());
        item.setUpdatedAt(LocalDateTime.now());
        return DtoMapper.toMap(attendance.save(item));
    }

    @GetMapping("/{id}")
    public Map<String, Object> get(@PathVariable Integer id) {
        return DtoMapper.toMap(attendance.findById(id).orElseThrow(
                () -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy chấm công")));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> create(@RequestBody AttendanceRequest request) {
        Attendance item = new Attendance();
        if (request.resolvedEmployeeId() != null) item.setEmployee(employees.getReferenceById(request.resolvedEmployeeId()));
        item.setCheckOutAt(request.checkOutAt());
        item.setAttendanceStatus(request.attendanceStatus());
        item.setApprovalStatus(request.approvalStatus());
        item.setNote(request.note());
        item.setId(null);
        return DtoMapper.toMap(attendance.save(item));
    }

    @PutMapping("/{id}")
    public Map<String, Object> update(@PathVariable Integer id, @RequestBody AttendanceRequest request) {
        Attendance item = attendance.findById(id).orElseThrow(
                () -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy chấm công"));
        item.setCheckOutAt(request.checkOutAt());
        item.setAttendanceStatus(request.attendanceStatus());
        item.setApprovalStatus(request.approvalStatus());
        item.setNote(request.note());
        return DtoMapper.toMap(attendance.save(item));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        attendance.delete(attendance.findById(id).orElseThrow(
                () -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy chấm công")));
    }

}
