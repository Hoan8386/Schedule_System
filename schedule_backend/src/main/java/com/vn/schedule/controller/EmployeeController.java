package com.vn.schedule.controller;

import org.springframework.http.ResponseEntity;

import com.vn.schedule.dto.request.EmployeeRequest;
import com.vn.schedule.dto.response.EmployeeResponse;
import com.vn.schedule.service.EmployeeService;

import org.springframework.web.bind.annotation.*;

import com.vn.schedule.util.anotation.ApiMessage;

@RestController
@RequestMapping("/api/v1/employees")
public class EmployeeController {
    private final EmployeeService service;

    public EmployeeController(EmployeeService service) {
        this.service = service;
    }

    @GetMapping
    @ApiMessage("Lấy dữ liệu")
    public ResponseEntity<java.util.List<EmployeeResponse>> list(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(service.findAll(status));
    }

    @GetMapping("/{id}")
    @ApiMessage("Lấy thông tin chi tiết")
    public ResponseEntity<EmployeeResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping

    @ApiMessage("Tạo mới dữ liệu")
    public ResponseEntity<EmployeeResponse> create(@RequestBody EmployeeRequest request) {
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED)
                .body(service.create(request));
    }

    @PutMapping("/{id}")
    @ApiMessage("Cập nhật dữ liệu")
    public ResponseEntity<EmployeeResponse> update(@PathVariable Integer id, @RequestBody EmployeeRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")

    @ApiMessage("Xóa dữ liệu")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
