package com.vn.schedule.controller;

import org.springframework.http.ResponseEntity;

import com.vn.schedule.dto.request.EmployeeRequest;
import com.vn.schedule.dto.response.EmployeePageResponse;
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

    /** Trang nhân sự: phân trang (mặc định 10, mới nhất trước), tìm kiếm, lọc và số liệu tổng trong một request. */
    @GetMapping("/page")
    @ApiMessage("Lấy danh sách nhân sự")
    public ResponseEntity<EmployeePageResponse> page(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer storeId,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String assignmentStatus,
            @RequestParam(required = false) Boolean primary,
            @RequestParam(required = false) String position) {
        return ResponseEntity.ok(service.page(page, size, sort, q, status, storeId, role, assignmentStatus, primary, position));
    }

    @GetMapping("/{id}")
    @ApiMessage("Lấy thông tin chi tiết")
    public ResponseEntity<EmployeeResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    @ApiMessage("Tạo mới nhân viên (tự động tạo tài khoản user và gửi email thông tin)")
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
