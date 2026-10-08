package com.vn.schedule.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vn.schedule.domain.TestAssignment;
import com.vn.schedule.dto.*;
import com.vn.schedule.service.TestAssignmentService;

import java.util.List;
import com.vn.schedule.util.anotation.ApiMessage;

@RestController
@RequestMapping("/api/v1/test_assignment")
public class TestAssignmentController {
    private final TestAssignmentService service;

    public TestAssignmentController(TestAssignmentService service) {
        this.service = service;
    }

    @GetMapping
    @ApiMessage("Lấy danh sách dữ liệu")
    public ResponseEntity<List<TestAssignmentResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    @ApiMessage("Lấy thông tin chi tiết")
    public ResponseEntity<TestAssignmentResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    @ApiMessage("Tạo mới dữ liệu")
    public ResponseEntity<TestAssignmentResponse> create(@RequestBody TestAssignmentRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    @ApiMessage("Cập nhật dữ liệu")
    public ResponseEntity<TestAssignmentResponse> update(@PathVariable Integer id, @RequestBody TestAssignmentRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    @ApiMessage("Xóa dữ liệu")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<TestAssignmentResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(value -> new TestAssignmentResponse(DtoMapper.toMap(value))).toList();
    }

    private TestAssignmentResponse response(Object value) {
        return new TestAssignmentResponse(DtoMapper.toMap(value));
    }
}
