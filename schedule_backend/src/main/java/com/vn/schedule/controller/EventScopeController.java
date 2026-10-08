package com.vn.schedule.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vn.schedule.domain.EventScope;
import com.vn.schedule.dto.*;
import com.vn.schedule.service.EventScopeService;

import java.util.List;
import com.vn.schedule.util.anotation.ApiMessage;

@RestController
@RequestMapping("/api/v1/event_scope")
public class EventScopeController {
    private final EventScopeService service;

    public EventScopeController(EventScopeService service) {
        this.service = service;
    }

    @GetMapping
    @ApiMessage("Lấy danh sách dữ liệu")
    public ResponseEntity<List<EventScopeResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    @ApiMessage("Lấy thông tin chi tiết")
    public ResponseEntity<EventScopeResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    @ApiMessage("Tạo mới dữ liệu")
    public ResponseEntity<EventScopeResponse> create(@RequestBody EventScopeRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    @ApiMessage("Cập nhật dữ liệu")
    public ResponseEntity<EventScopeResponse> update(@PathVariable Integer id, @RequestBody EventScopeRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    @ApiMessage("Xóa dữ liệu")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<EventScopeResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(value -> new EventScopeResponse(DtoMapper.toMap(value))).toList();
    }

    private EventScopeResponse response(Object value) {
        return new EventScopeResponse(DtoMapper.toMap(value));
    }
}
