package com.vn.shopping.controller;


import com.vn.shopping.dto.*;
import com.vn.shopping.domain.Attendance;
import com.vn.shopping.dto.AttendanceRequest;
import com.vn.shopping.dto.CheckInRequest;
import com.vn.shopping.dto.DtoMapper;
import com.vn.shopping.repository.AttendanceRepository;
import com.vn.shopping.repository.EmployeeRepository;
import com.vn.shopping.util.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

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
    public ResponseEntity<List<AttendanceResponse>> list(@RequestParam(required = false) Integer employeeId) {
        return ResponseEntity.ok(responses(employeeId == null ? attendance.findAll() : attendance.findByEmployeeIdOrderByCheckInAtDesc(employeeId)));
    }

    @PostMapping("/check-in")

    public ResponseEntity<AttendanceResponse> checkIn(@RequestBody CheckInRequest request) {
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
        return ResponseEntity.status(HttpStatus.CREATED).body(response(attendance.save(item)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AttendanceResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(attendance.findById(id).orElseThrow(
                () -> new ApiException(HttpStatus.NOT_FOUND, "KhÃ´ng tÃ¬m tháº¥y cháº¥m cÃ´ng"))));
    }

    @PostMapping

    public ResponseEntity<AttendanceResponse> create(@RequestBody AttendanceRequest request) {
        Attendance item = new Attendance();
        if (request.resolvedEmployeeId() != null) item.setEmployee(employees.getReferenceById(request.resolvedEmployeeId()));
        item.setCheckOutAt(request.checkOutAt());
        item.setAttendanceStatus(request.attendanceStatus());
        item.setApprovalStatus(request.approvalStatus());
        item.setNote(request.note());
        item.setId(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(response(attendance.save(item)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AttendanceResponse> update(@PathVariable Integer id, @RequestBody AttendanceRequest request) {
        Attendance item = attendance.findById(id).orElseThrow(
                () -> new ApiException(HttpStatus.NOT_FOUND, "KhÃ´ng tÃ¬m tháº¥y cháº¥m cÃ´ng"));
        item.setCheckOutAt(request.checkOutAt());
        item.setAttendanceStatus(request.attendanceStatus());
        item.setApprovalStatus(request.approvalStatus());
        item.setNote(request.note());
        return ResponseEntity.ok(response(attendance.save(item)));
    }

    @DeleteMapping("/{id}")

    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        attendance.delete(attendance.findById(id).orElseThrow(
                () -> new ApiException(HttpStatus.NOT_FOUND, "KhÃ´ng tÃ¬m tháº¥y cháº¥m cÃ´ng")));
        return ResponseEntity.noContent().build();
    }


    private List<AttendanceResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(AttendanceResponse::new).toList();
    }

    private AttendanceResponse response(Object value) {
        return new AttendanceResponse(DtoMapper.toMap(value));
    }
}