package com.vn.shopping.controller;

import com.vn.shopping.dto.*;
import com.vn.shopping.dto.DtoMapper;

import com.vn.shopping.domain.EmployeeStore;
import com.vn.shopping.service.EmployeeStoreService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/employee_store")
public class EmployeeStoreController {
    private final EmployeeStoreService service;

    public EmployeeStoreController(EmployeeStoreService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<EmployeeStoreResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeStoreResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    public ResponseEntity<EmployeeStoreResponse> create(@RequestBody EmployeeStoreRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeStoreResponse> update(@PathVariable Integer id, @RequestBody EmployeeStoreRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

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