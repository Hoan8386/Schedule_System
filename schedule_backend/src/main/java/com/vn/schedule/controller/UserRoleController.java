package com.vn.schedule.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vn.schedule.domain.UserRole;
import com.vn.schedule.dto.*;
import com.vn.schedule.service.UserRoleService;

import java.util.List;
import com.vn.schedule.util.anotation.ApiMessage;

@RestController
@RequestMapping("/api/v1/user_role")
public class UserRoleController {
    private final UserRoleService service;

    public UserRoleController(UserRoleService service) {
        this.service = service;
    }

    @GetMapping
    @ApiMessage("Lấy danh sách dữ liệu")
    public ResponseEntity<List<UserRoleResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @PostMapping

    @ApiMessage("Tạo mới dữ liệu")
    public ResponseEntity<UserRoleResponse> create(@RequestBody UserRoleRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.save(body)));
    }

    @PutMapping
    @ApiMessage("Cập nhật dữ liệu")
    public ResponseEntity<UserRoleResponse> update(@RequestBody UserRoleRequest body) {
        return ResponseEntity.ok(response(service.save(body)));
    }

    @DeleteMapping

    @ApiMessage("Xóa dữ liệu")
    public ResponseEntity<Void> delete(@RequestBody UserRoleRequest body) {
        service.deleteBody(body);
        return ResponseEntity.noContent().build();
    }

    private List<UserRoleResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(value -> new UserRoleResponse(DtoMapper.toMap(value))).toList();
    }

    private UserRoleResponse response(Object value) {
        return new UserRoleResponse(DtoMapper.toMap(value));
    }
}
