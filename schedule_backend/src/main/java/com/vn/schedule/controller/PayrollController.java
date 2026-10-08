package com.vn.schedule.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vn.schedule.domain.Payroll;
import com.vn.schedule.dto.*;
import com.vn.schedule.dto.request.*;
import com.vn.schedule.dto.response.*;
import com.vn.schedule.service.PayrollService;

import java.util.List;
import com.vn.schedule.util.anotation.ApiMessage;

@RestController
@RequestMapping("/api/v1/payroll")
public class PayrollController {
    private final PayrollService service;

    public PayrollController(PayrollService service) {
        this.service = service;
    }

    @GetMapping
    @ApiMessage("Lấy danh sách dữ liệu")
    public ResponseEntity<List<PayrollResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    @ApiMessage("Lấy thông tin chi tiết")
    public ResponseEntity<PayrollResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    @ApiMessage("Tạo mới dữ liệu")
    public ResponseEntity<PayrollResponse> create(@RequestBody PayrollRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    @ApiMessage("Cập nhật dữ liệu")
    public ResponseEntity<PayrollResponse> update(@PathVariable Integer id, @RequestBody PayrollRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    @ApiMessage("Xóa dữ liệu")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<PayrollResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(value -> new PayrollResponse(DtoMapper.toMap(value))).toList();
    }

    private PayrollResponse response(Object value) {
        return new PayrollResponse(DtoMapper.toMap(value));
    }
}
