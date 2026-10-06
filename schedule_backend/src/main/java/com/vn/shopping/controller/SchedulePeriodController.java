package com.vn.shopping.controller;

import com.vn.shopping.dto.*;
import com.vn.shopping.dto.DtoMapper;

import com.vn.shopping.domain.SchedulePeriod;
import com.vn.shopping.service.SchedulePeriodService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/schedule_period")
public class SchedulePeriodController {
    private final SchedulePeriodService service;

    public SchedulePeriodController(SchedulePeriodService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<SchedulePeriodResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SchedulePeriodResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    public ResponseEntity<SchedulePeriodResponse> create(@RequestBody SchedulePeriodRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SchedulePeriodResponse> update(@PathVariable Integer id, @RequestBody SchedulePeriodRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

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