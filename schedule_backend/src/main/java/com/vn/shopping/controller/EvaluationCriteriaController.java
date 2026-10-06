package com.vn.shopping.controller;

import com.vn.shopping.dto.*;
import com.vn.shopping.dto.DtoMapper;

import com.vn.shopping.domain.EvaluationCriteria;
import com.vn.shopping.service.EvaluationCriteriaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/evaluation_criteria")
public class EvaluationCriteriaController {
    private final EvaluationCriteriaService service;

    public EvaluationCriteriaController(EvaluationCriteriaService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<EvaluationCriteriaResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EvaluationCriteriaResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    public ResponseEntity<EvaluationCriteriaResponse> create(@RequestBody EvaluationCriteriaRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EvaluationCriteriaResponse> update(@PathVariable Integer id, @RequestBody EvaluationCriteriaRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<EvaluationCriteriaResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(EvaluationCriteriaResponse::new).toList();
    }

    private EvaluationCriteriaResponse response(Object value) {
        return new EvaluationCriteriaResponse(DtoMapper.toMap(value));
    }
}