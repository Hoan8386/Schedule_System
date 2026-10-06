package com.vn.schedule.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vn.schedule.domain.RolePermission;
import com.vn.schedule.dto.*;
import com.vn.schedule.service.RolePermissionService;

import java.util.List;
import com.vn.schedule.util.anotation.ApiMessage;

@RestController
@RequestMapping("/role_permission")
public class RolePermissionController {
    private final RolePermissionService service;

    public RolePermissionController(RolePermissionService service) {
        this.service = service;
    }

    @GetMapping
    @ApiMessage("Lấy danh sách dữ liệu")
    public ResponseEntity<List<RolePermissionResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @PostMapping

    @ApiMessage("Tạo mới dữ liệu")
    public ResponseEntity<RolePermissionResponse> create(@RequestBody RolePermissionRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.save(body)));
    }

    @PutMapping
    @ApiMessage("Cập nhật dữ liệu")
    public ResponseEntity<RolePermissionResponse> update(@RequestBody RolePermissionRequest body) {
        return ResponseEntity.ok(response(service.save(body)));
    }

    @DeleteMapping

    @ApiMessage("Xóa dữ liệu")
    public ResponseEntity<Void> delete(@RequestBody RolePermissionRequest body) {
        service.deleteBody(body);
        return ResponseEntity.noContent().build();
    }

    private List<RolePermissionResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(RolePermissionResponse::new).toList();
    }

    private RolePermissionResponse response(Object value) {
        return new RolePermissionResponse(DtoMapper.toMap(value));
    }
}
