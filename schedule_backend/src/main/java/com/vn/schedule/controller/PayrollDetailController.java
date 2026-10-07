package com.vn.schedule.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vn.schedule.domain.PayrollDetail;
import com.vn.schedule.dto.*;
import com.vn.schedule.service.PayrollDetailService;

import java.util.List;
import com.vn.schedule.util.anotation.ApiMessage;

@RestController
@RequestMapping("/api/v1/payroll_detail")
public class PayrollDetailController {
    private final PayrollDetailService service;

    public PayrollDetailController(PayrollDetailService service) {
        this.service = service;
    }

    @GetMapping
    @ApiMessage("Lấy danh sách dữ liệu")
    public ResponseEntity<List<PayrollDetailResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    @ApiMessage("Lấy thông tin chi tiết")
    public ResponseEntity<PayrollDetailResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    @ApiMessage("Tạo mới dữ liệu")
    public ResponseEntity<PayrollDetailResponse> create(@RequestBody PayrollDetailRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    @ApiMessage("Cập nhật dữ liệu")
    public ResponseEntity<PayrollDetailResponse> update(@PathVariable Integer id, @RequestBody PayrollDetailRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    @ApiMessage("Xóa dữ liệu")
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
