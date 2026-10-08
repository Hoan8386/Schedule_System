package com.vn.schedule.controller;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vn.schedule.dto.*;
import java.util.List;
import com.vn.schedule.util.anotation.ApiMessage;
import com.vn.schedule.service.AttendanceService;

@RestController
@RequestMapping("/api/v1/attendance")
public class AttendanceController {
    private final AttendanceService attendance;

    public AttendanceController(AttendanceService attendance) {
        this.attendance = attendance;
    }

    @GetMapping
    @ApiMessage("Lấy dữ liệu")
    public ResponseEntity<List<AttendanceResponse>> list(@RequestParam(required = false) Integer employeeId) {
        return ResponseEntity.ok(attendance.findAll(employeeId));
    }

    @PostMapping("/check-in")

    @ApiMessage("Tạo mới dữ liệu")
    public ResponseEntity<AttendanceResponse> checkIn(@RequestBody CheckInRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(attendance.checkIn(request));
    }

    @GetMapping("/{id}")
    @ApiMessage("Lấy thông tin chi tiết")
    public ResponseEntity<AttendanceResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(attendance.findResponseById(id));
    }

    @PostMapping

    @ApiMessage("Tạo mới dữ liệu")
    public ResponseEntity<AttendanceResponse> create(@RequestBody AttendanceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                attendance.create(request));
    }

    @PutMapping("/{id}")
    @ApiMessage("Cập nhật dữ liệu")
    public ResponseEntity<AttendanceResponse> update(@PathVariable Integer id, @RequestBody AttendanceRequest request) {
        return ResponseEntity.ok(attendance.update(id, request));
    }

    @DeleteMapping("/{id}")

    @ApiMessage("Xóa dữ liệu")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        attendance.delete(id);
        return ResponseEntity.noContent().build();
    }
}
