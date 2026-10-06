package com.vn.shopping.controller;

import com.vn.shopping.dto.*;
import com.vn.shopping.dto.DtoMapper;

import com.vn.shopping.domain.SpecialEvent;
import com.vn.shopping.service.SpecialEventService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/special_event")
public class SpecialEventController {
    private final SpecialEventService service;

    public SpecialEventController(SpecialEventService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<SpecialEventResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SpecialEventResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    public ResponseEntity<SpecialEventResponse> create(@RequestBody SpecialEventRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SpecialEventResponse> update(@PathVariable Integer id, @RequestBody SpecialEventRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

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