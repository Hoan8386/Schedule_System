package com.vn.shopping.controller;

import com.vn.shopping.dto.*;
import com.vn.shopping.dto.DtoMapper;

import com.vn.shopping.domain.TestAssignment;
import com.vn.shopping.service.TestAssignmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/test_assignment")
public class TestAssignmentController {
    private final TestAssignmentService service;

    public TestAssignmentController(TestAssignmentService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<TestAssignmentResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TestAssignmentResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    public ResponseEntity<TestAssignmentResponse> create(@RequestBody TestAssignmentRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TestAssignmentResponse> update(@PathVariable Integer id, @RequestBody TestAssignmentRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<TestAssignmentResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(TestAssignmentResponse::new).toList();
    }

    private TestAssignmentResponse response(Object value) {
        return new TestAssignmentResponse(DtoMapper.toMap(value));
    }
}