package com.vn.shopping.controller;

import com.vn.shopping.dto.*;
import com.vn.shopping.dto.DtoMapper;

import com.vn.shopping.domain.Variable;
import com.vn.shopping.service.VariableService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/variable")
public class VariableController {
    private final VariableService service;

    public VariableController(VariableService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<VariableResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VariableResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    public ResponseEntity<VariableResponse> create(@RequestBody VariableRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VariableResponse> update(@PathVariable Integer id, @RequestBody VariableRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<VariableResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(VariableResponse::new).toList();
    }

    private VariableResponse response(Object value) {
        return new VariableResponse(DtoMapper.toMap(value));
    }
}