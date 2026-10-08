package com.vn.schedule.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vn.schedule.domain.Role;
import com.vn.schedule.dto.*;
import com.vn.schedule.dto.request.*;
import com.vn.schedule.dto.response.*;
import com.vn.schedule.service.RoleService;

import java.util.List;
import com.vn.schedule.util.anotation.ApiMessage;

@RestController
@RequestMapping("/api/v1/role")
public class RoleController {
    private final RoleService service;

    public RoleController(RoleService service) {
        this.service = service;
    }

    @GetMapping
    @ApiMessage("Lấy danh sách dữ liệu")
    public ResponseEntity<List<RoleResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    @ApiMessage("Lấy thông tin chi tiết")
    public ResponseEntity<RoleResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    @ApiMessage("Tạo mới dữ liệu")
    public ResponseEntity<RoleResponse> create(@RequestBody RoleRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    @ApiMessage("Cập nhật dữ liệu")
    public ResponseEntity<RoleResponse> update(@PathVariable Integer id, @RequestBody RoleRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    @ApiMessage("Xóa dữ liệu")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<RoleResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(value -> new RoleResponse(DtoMapper.toMap(value))).toList();
    }

    private RoleResponse response(Object value) {
        return new RoleResponse(DtoMapper.toMap(value));
    }
}
