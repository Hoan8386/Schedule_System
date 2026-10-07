package com.vn.schedule.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vn.schedule.domain.SchedulePeriod;
import com.vn.schedule.dto.*;
import com.vn.schedule.service.SchedulePeriodService;

import java.util.List;
import com.vn.schedule.util.anotation.ApiMessage;

@RestController
@RequestMapping("/api/v1/schedule_period")
public class SchedulePeriodController {
    private final SchedulePeriodService service;

    public SchedulePeriodController(SchedulePeriodService service) {
        this.service = service;
    }

    @GetMapping
    @ApiMessage("Lấy danh sách dữ liệu")
    public ResponseEntity<List<SchedulePeriodResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    @ApiMessage("Lấy thông tin chi tiết")
    public ResponseEntity<SchedulePeriodResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    @ApiMessage("Tạo mới dữ liệu")
    public ResponseEntity<SchedulePeriodResponse> create(@RequestBody SchedulePeriodRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    @ApiMessage("Cập nhật dữ liệu")
    public ResponseEntity<SchedulePeriodResponse> update(@PathVariable Integer id, @RequestBody SchedulePeriodRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    @ApiMessage("Xóa dữ liệu")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<SchedulePeriodResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(SchedulePeriodResponse::new).toList();
    }

    private SchedulePeriodResponse response(Object value) {
        return new SchedulePeriodResponse(DtoMapper.toMap(value));
    }
}
