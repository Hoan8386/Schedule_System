package com.vn.schedule.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vn.schedule.domain.StoreManager;
import com.vn.schedule.dto.*;
import com.vn.schedule.service.StoreManagerService;

import java.util.List;
import com.vn.schedule.util.anotation.ApiMessage;

@RestController
@RequestMapping("/api/v1/store_manager")
public class StoreManagerController {
    private final StoreManagerService service;

    public StoreManagerController(StoreManagerService service) {
        this.service = service;
    }

    @GetMapping
    @ApiMessage("Lấy danh sách dữ liệu")
    public ResponseEntity<List<StoreManagerResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    @ApiMessage("Lấy thông tin chi tiết")
    public ResponseEntity<StoreManagerResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    @ApiMessage("Tạo mới dữ liệu")
    public ResponseEntity<StoreManagerResponse> create(@RequestBody StoreManagerRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    @ApiMessage("Cập nhật dữ liệu")
    public ResponseEntity<StoreManagerResponse> update(@PathVariable Integer id, @RequestBody StoreManagerRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    @ApiMessage("Xóa dữ liệu")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<StoreManagerResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(value -> new StoreManagerResponse(DtoMapper.toMap(value))).toList();
    }

    private StoreManagerResponse response(Object value) {
        return new StoreManagerResponse(DtoMapper.toMap(value));
    }
}
