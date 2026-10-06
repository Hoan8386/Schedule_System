package com.vn.schedule.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vn.schedule.domain.EvaluationDetail;
import com.vn.schedule.dto.*;
import com.vn.schedule.service.EvaluationDetailService;

import java.util.List;
import com.vn.schedule.util.anotation.ApiMessage;

@RestController
@RequestMapping("/evaluation_detail")
public class EvaluationDetailController {
    private final EvaluationDetailService service;

    public EvaluationDetailController(EvaluationDetailService service) {
        this.service = service;
    }

    @GetMapping
    @ApiMessage("Lấy danh sách dữ liệu")
    public ResponseEntity<List<EvaluationDetailResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    @ApiMessage("Lấy thông tin chi tiết")
    public ResponseEntity<EvaluationDetailResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    @ApiMessage("Tạo mới dữ liệu")
    public ResponseEntity<EvaluationDetailResponse> create(@RequestBody EvaluationDetailRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    @ApiMessage("Cập nhật dữ liệu")
    public ResponseEntity<EvaluationDetailResponse> update(@PathVariable Integer id, @RequestBody EvaluationDetailRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    @ApiMessage("Xóa dữ liệu")
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
