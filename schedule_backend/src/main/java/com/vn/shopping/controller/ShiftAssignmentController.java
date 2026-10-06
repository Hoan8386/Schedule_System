package com.vn.shopping.controller;

import com.vn.shopping.dto.*;
import com.vn.shopping.dto.DtoMapper;

import com.vn.shopping.domain.ShiftAssignment;
import com.vn.shopping.service.ShiftAssignmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/shift_assignment")
public class ShiftAssignmentController {
    private final ShiftAssignmentService service;

    public ShiftAssignmentController(ShiftAssignmentService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ShiftAssignmentResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShiftAssignmentResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    public ResponseEntity<ShiftAssignmentResponse> create(@RequestBody ShiftAssignmentRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ShiftAssignmentResponse> update(@PathVariable Integer id, @RequestBody ShiftAssignmentRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<ShiftAssignmentResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(ShiftAssignmentResponse::new).toList();
    }

    private ShiftAssignmentResponse response(Object value) {
        return new ShiftAssignmentResponse(DtoMapper.toMap(value));
    }
}