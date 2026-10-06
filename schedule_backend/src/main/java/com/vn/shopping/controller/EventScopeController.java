package com.vn.shopping.controller;

import com.vn.shopping.dto.*;
import com.vn.shopping.dto.DtoMapper;

import com.vn.shopping.domain.EventScope;
import com.vn.shopping.service.EventScopeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/event_scope")
public class EventScopeController {
    private final EventScopeService service;

    public EventScopeController(EventScopeService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<EventScopeResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventScopeResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    public ResponseEntity<EventScopeResponse> create(@RequestBody EventScopeRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventScopeResponse> update(@PathVariable Integer id, @RequestBody EventScopeRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<EventScopeResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(EventScopeResponse::new).toList();
    }

    private EventScopeResponse response(Object value) {
        return new EventScopeResponse(DtoMapper.toMap(value));
    }
}