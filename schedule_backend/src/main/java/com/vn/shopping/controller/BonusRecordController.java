package com.vn.shopping.controller;

import com.vn.shopping.dto.*;
import com.vn.shopping.dto.DtoMapper;

import com.vn.shopping.domain.BonusRecord;
import com.vn.shopping.service.BonusRecordService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/bonus_record")
public class BonusRecordController {
    private final BonusRecordService service;

    public BonusRecordController(BonusRecordService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<BonusRecordResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BonusRecordResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    public ResponseEntity<BonusRecordResponse> create(@RequestBody BonusRecordRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BonusRecordResponse> update(@PathVariable Integer id, @RequestBody BonusRecordRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<BonusRecordResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(BonusRecordResponse::new).toList();
    }

    private BonusRecordResponse response(Object value) {
        return new BonusRecordResponse(DtoMapper.toMap(value));
    }
}