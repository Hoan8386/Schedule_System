package com.vn.shopping.controller;

import com.vn.shopping.dto.*;
import com.vn.shopping.dto.DtoMapper;

import com.vn.shopping.domain.StoreManager;
import com.vn.shopping.service.StoreManagerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/store_manager")
public class StoreManagerController {
    private final StoreManagerService service;

    public StoreManagerController(StoreManagerService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<StoreManagerResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StoreManagerResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    public ResponseEntity<StoreManagerResponse> create(@RequestBody StoreManagerRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StoreManagerResponse> update(@PathVariable Integer id, @RequestBody StoreManagerRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<StoreManagerResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(StoreManagerResponse::new).toList();
    }

    private StoreManagerResponse response(Object value) {
        return new StoreManagerResponse(DtoMapper.toMap(value));
    }
}