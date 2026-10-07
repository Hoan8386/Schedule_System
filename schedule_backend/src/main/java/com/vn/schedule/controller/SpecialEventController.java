package com.vn.schedule.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vn.schedule.domain.SpecialEvent;
import com.vn.schedule.dto.*;
import com.vn.schedule.service.SpecialEventService;

import java.util.List;
import com.vn.schedule.util.anotation.ApiMessage;

@RestController
@RequestMapping("/api/v1/special_event")
public class SpecialEventController {
    private final SpecialEventService service;

    public SpecialEventController(SpecialEventService service) {
        this.service = service;
    }

    @GetMapping
    @ApiMessage("Lấy danh sách dữ liệu")
    public ResponseEntity<List<SpecialEventResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    @ApiMessage("Lấy thông tin chi tiết")
    public ResponseEntity<SpecialEventResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    @ApiMessage("Tạo mới dữ liệu")
    public ResponseEntity<SpecialEventResponse> create(@RequestBody SpecialEventRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    @ApiMessage("Cập nhật dữ liệu")
    public ResponseEntity<SpecialEventResponse> update(@PathVariable Integer id, @RequestBody SpecialEventRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    @ApiMessage("Xóa dữ liệu")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<SpecialEventResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(SpecialEventResponse::new).toList();
    }

    private SpecialEventResponse response(Object value) {
        return new SpecialEventResponse(DtoMapper.toMap(value));
    }
}
