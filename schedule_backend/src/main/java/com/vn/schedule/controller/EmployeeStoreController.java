package com.vn.schedule.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vn.schedule.domain.EmployeeStore;
import com.vn.schedule.dto.*;
import com.vn.schedule.service.EmployeeStoreService;

import java.util.List;
import com.vn.schedule.util.anotation.ApiMessage;

@RestController
@RequestMapping("/employee_store")
public class EmployeeStoreController {
    private final EmployeeStoreService service;

    public EmployeeStoreController(EmployeeStoreService service) {
        this.service = service;
    }

    @GetMapping
    @ApiMessage("Lấy danh sách dữ liệu")
    public ResponseEntity<List<EmployeeStoreResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    @ApiMessage("Lấy thông tin chi tiết")
    public ResponseEntity<EmployeeStoreResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    @ApiMessage("Tạo mới dữ liệu")
    public ResponseEntity<EmployeeStoreResponse> create(@RequestBody EmployeeStoreRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    @ApiMessage("Cập nhật dữ liệu")
    public ResponseEntity<EmployeeStoreResponse> update(@PathVariable Integer id, @RequestBody EmployeeStoreRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    @ApiMessage("Xóa dữ liệu")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<EmployeeStoreResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(EmployeeStoreResponse::new).toList();
    }

    private EmployeeStoreResponse response(Object value) {
        return new EmployeeStoreResponse(DtoMapper.toMap(value));
    }
}
