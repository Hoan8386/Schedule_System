package com.vn.shopping.controller;

import com.vn.shopping.dto.*;
import com.vn.shopping.dto.DtoMapper;

import com.vn.shopping.domain.Violation;
import com.vn.shopping.service.ViolationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/violation")
public class ViolationController {
    private final ViolationService service;

    public ViolationController(ViolationService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ViolationResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ViolationResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    public ResponseEntity<ViolationResponse> create(@RequestBody ViolationRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ViolationResponse> update(@PathVariable Integer id, @RequestBody ViolationRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<ViolationResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(ViolationResponse::new).toList();
    }

    private ViolationResponse response(Object value) {
        return new ViolationResponse(DtoMapper.toMap(value));
    }
}