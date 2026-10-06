package com.vn.shopping.controller;

import com.vn.shopping.dto.*;
import com.vn.shopping.dto.DtoMapper;

import com.vn.shopping.domain.PayrollDetail;
import com.vn.shopping.service.PayrollDetailService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/payroll_detail")
public class PayrollDetailController {
    private final PayrollDetailService service;

    public PayrollDetailController(PayrollDetailService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<PayrollDetailResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PayrollDetailResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    public ResponseEntity<PayrollDetailResponse> create(@RequestBody PayrollDetailRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PayrollDetailResponse> update(@PathVariable Integer id, @RequestBody PayrollDetailRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<PayrollDetailResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(PayrollDetailResponse::new).toList();
    }

    private PayrollDetailResponse response(Object value) {
        return new PayrollDetailResponse(DtoMapper.toMap(value));
    }
}