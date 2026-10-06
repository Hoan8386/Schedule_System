package com.vn.shopping.controller;

import com.vn.shopping.dto.*;
import com.vn.shopping.dto.DtoMapper;

import com.vn.shopping.domain.EvaluationDetail;
import com.vn.shopping.service.EvaluationDetailService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/evaluation_detail")
public class EvaluationDetailController {
    private final EvaluationDetailService service;

    public EvaluationDetailController(EvaluationDetailService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<EvaluationDetailResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EvaluationDetailResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    public ResponseEntity<EvaluationDetailResponse> create(@RequestBody EvaluationDetailRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EvaluationDetailResponse> update(@PathVariable Integer id, @RequestBody EvaluationDetailRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<EvaluationDetailResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(EvaluationDetailResponse::new).toList();
    }

    private EvaluationDetailResponse response(Object value) {
        return new EvaluationDetailResponse(DtoMapper.toMap(value));
    }
}