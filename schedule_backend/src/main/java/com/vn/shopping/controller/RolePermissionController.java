package com.vn.shopping.controller;

import com.vn.shopping.dto.*;
import com.vn.shopping.dto.DtoMapper;

import com.vn.shopping.domain.RolePermission;
import com.vn.shopping.service.RolePermissionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/role_permission")
public class RolePermissionController {
    private final RolePermissionService service;

    public RolePermissionController(RolePermissionService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<RolePermissionResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @PostMapping

    public ResponseEntity<RolePermissionResponse> create(@RequestBody RolePermissionRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.save(body)));
    }

    @PutMapping
    public ResponseEntity<RolePermissionResponse> update(@RequestBody RolePermissionRequest body) {
        return ResponseEntity.ok(response(service.save(body)));
    }

    @DeleteMapping

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