package com.vn.schedule.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vn.schedule.domain.Shift;
import com.vn.schedule.dto.*;
import com.vn.schedule.dto.request.*;
import com.vn.schedule.dto.response.*;
import com.vn.schedule.service.ShiftService;

import java.util.List;
import com.vn.schedule.util.anotation.ApiMessage;

@RestController
@RequestMapping("/api/v1/shift")
public class ShiftController {
    private final ShiftService service;

    public ShiftController(ShiftService service) {
        this.service = service;
    }

    @GetMapping
    @ApiMessage("Lấy danh sách dữ liệu")
    public ResponseEntity<List<ShiftResponse>> list(
            @RequestParam(required = false) Integer storeId,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(responses(service.findAll(storeId, status)));
    }

    @GetMapping("/{id}")
    @ApiMessage("Lấy thông tin chi tiết")
    public ResponseEntity<ShiftResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    @ApiMessage("Tạo mới dữ liệu")
    public ResponseEntity<ShiftResponse> create(@RequestBody ShiftRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    @ApiMessage("Cập nhật dữ liệu")
    public ResponseEntity<ShiftResponse> update(@PathVariable Integer id, @RequestBody ShiftRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    @ApiMessage("Xóa dữ liệu")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<ShiftResponse> responses(java.util.Collection<Shift> values) {
        return values.stream().map(this::response).toList();
    }

    private ShiftResponse response(Shift value) {
        java.util.Map<String, Object> result = DtoMapper.toMap(value);
        if (value.getStore() != null) {
            result.put("storeId", value.getStore().getId());
            result.put("storeName", value.getStore().getStoreName());
        }
        return new ShiftResponse(result);
    }
}
