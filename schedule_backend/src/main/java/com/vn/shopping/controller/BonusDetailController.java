package com.vn.shopping.controller;

import com.vn.shopping.dto.*;
import com.vn.shopping.dto.DtoMapper;

import com.vn.shopping.domain.BonusDetail;
import com.vn.shopping.service.BonusDetailService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/bonus_detail")
public class BonusDetailController {
    private final BonusDetailService service;

    public BonusDetailController(BonusDetailService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<BonusDetailResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BonusDetailResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    public ResponseEntity<BonusDetailResponse> create(@RequestBody BonusDetailRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BonusDetailResponse> update(@PathVariable Integer id, @RequestBody BonusDetailRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<BonusDetailResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(BonusDetailResponse::new).toList();
    }

    private BonusDetailResponse response(Object value) {
        return new BonusDetailResponse(DtoMapper.toMap(value));
    }
}