package com.vn.schedule.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vn.schedule.dto.*;
import com.vn.schedule.dto.request.*;
import com.vn.schedule.dto.response.*;
import com.vn.schedule.service.ShiftByDateService;

import java.util.List;
import java.time.LocalDate;
import com.vn.schedule.util.anotation.ApiMessage;

@RestController
@RequestMapping("/api/v1/shift_by_date")
public class ShiftByDateController {
    private final ShiftByDateService service;

    public ShiftByDateController(ShiftByDateService service) {
        this.service = service;
    }

    @GetMapping
    @ApiMessage("Lấy danh sách dữ liệu")
    public ResponseEntity<List<ShiftByDateResponse>> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to,
            @RequestParam(required = false) Integer storeId,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(service.findAll(q, from, to, storeId, status));
    }

    @GetMapping("/{id}")
    @ApiMessage("Lấy thông tin chi tiết")
    public ResponseEntity<ShiftByDateResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(service.findResponseById(id));
    }

    @PostMapping

    @ApiMessage("Tạo mới dữ liệu")
    public ResponseEntity<ShiftByDateResponse> create(@RequestBody ShiftByDateRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(body));
    }

    @PutMapping("/{id}")
    @ApiMessage("Cập nhật dữ liệu")
    public ResponseEntity<ShiftByDateResponse> update(@PathVariable Integer id, @RequestBody ShiftByDateRequest body) {
        return ResponseEntity.ok(service.update(id, body));
    }

    @DeleteMapping("/{id}")

    @ApiMessage("Xóa dữ liệu")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
