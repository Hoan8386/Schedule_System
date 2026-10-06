package com.vn.shopping.controller;

import com.vn.shopping.dto.*;
import com.vn.shopping.dto.DtoMapper;

import com.vn.shopping.domain.EmployeeEvaluation;
import com.vn.shopping.service.EmployeeEvaluationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/employee_evaluation")
public class EmployeeEvaluationController {
    private final EmployeeEvaluationService service;

    public EmployeeEvaluationController(EmployeeEvaluationService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<EmployeeEvaluationResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeEvaluationResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    public ResponseEntity<EmployeeEvaluationResponse> create(@RequestBody EmployeeEvaluationRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeEvaluationResponse> update(@PathVariable Integer id, @RequestBody EmployeeEvaluationRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<EmployeeEvaluationResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(EmployeeEvaluationResponse::new).toList();
    }

    private EmployeeEvaluationResponse response(Object value) {
        return new EmployeeEvaluationResponse(DtoMapper.toMap(value));
    }
}