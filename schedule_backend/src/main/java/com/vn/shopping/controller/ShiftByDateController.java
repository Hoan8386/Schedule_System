package com.vn.shopping.controller;

import com.vn.shopping.dto.*;
import com.vn.shopping.dto.DtoMapper;

import com.vn.shopping.domain.ShiftByDate;
import com.vn.shopping.service.ShiftByDateService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/shift_by_date")
public class ShiftByDateController {
    private final ShiftByDateService service;

    public ShiftByDateController(ShiftByDateService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ShiftByDateResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShiftByDateResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    public ResponseEntity<ShiftByDateResponse> create(@RequestBody ShiftByDateRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ShiftByDateResponse> update(@PathVariable Integer id, @RequestBody ShiftByDateRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<ShiftByDateResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(ShiftByDateResponse::new).toList();
    }

    private ShiftByDateResponse response(Object value) {
        return new ShiftByDateResponse(DtoMapper.toMap(value));
    }
}