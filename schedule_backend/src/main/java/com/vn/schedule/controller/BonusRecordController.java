package com.vn.schedule.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vn.schedule.domain.BonusRecord;
import com.vn.schedule.dto.*;
import com.vn.schedule.service.BonusRecordService;

import java.util.List;
import com.vn.schedule.util.anotation.ApiMessage;

@RestController
@RequestMapping("/api/v1/bonus_record")
public class BonusRecordController {
    private final BonusRecordService service;

    public BonusRecordController(BonusRecordService service) {
        this.service = service;
    }

    @GetMapping
    @ApiMessage("Lấy danh sách dữ liệu")
    public ResponseEntity<List<BonusRecordResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    @ApiMessage("Lấy thông tin chi tiết")
    public ResponseEntity<BonusRecordResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    @ApiMessage("Tạo mới dữ liệu")
    public ResponseEntity<BonusRecordResponse> create(@RequestBody BonusRecordRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    @ApiMessage("Cập nhật dữ liệu")
    public ResponseEntity<BonusRecordResponse> update(@PathVariable Integer id, @RequestBody BonusRecordRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    @ApiMessage("Xóa dữ liệu")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<BonusRecordResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(value -> new BonusRecordResponse(DtoMapper.toMap(value))).toList();
    }

    private BonusRecordResponse response(Object value) {
        return new BonusRecordResponse(DtoMapper.toMap(value));
    }
}
