package com.vn.schedule.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vn.schedule.domain.EmployeeEvaluation;
import com.vn.schedule.dto.*;
import com.vn.schedule.service.EmployeeEvaluationService;

import java.util.List;
import com.vn.schedule.util.anotation.ApiMessage;

@RestController
@RequestMapping("/api/v1/employee_evaluation")
public class EmployeeEvaluationController {
    private final EmployeeEvaluationService service;

    public EmployeeEvaluationController(EmployeeEvaluationService service) {
        this.service = service;
    }

    @GetMapping
    @ApiMessage("Lấy danh sách dữ liệu")
    public ResponseEntity<List<EmployeeEvaluationResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    @ApiMessage("Lấy thông tin chi tiết")
    public ResponseEntity<EmployeeEvaluationResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    @ApiMessage("Tạo mới dữ liệu")
    public ResponseEntity<EmployeeEvaluationResponse> create(@RequestBody EmployeeEvaluationRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    @ApiMessage("Cập nhật dữ liệu")
    public ResponseEntity<EmployeeEvaluationResponse> update(@PathVariable Integer id, @RequestBody EmployeeEvaluationRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    @ApiMessage("Xóa dữ liệu")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<EmployeeEvaluationResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(value -> new EmployeeEvaluationResponse(DtoMapper.toMap(value))).toList();
    }

    private EmployeeEvaluationResponse response(Object value) {
        return new EmployeeEvaluationResponse(DtoMapper.toMap(value));
    }
}
