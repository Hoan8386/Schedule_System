package com.vn.shopping.controller;

import com.vn.shopping.dto.*;
import com.vn.shopping.dto.DtoMapper;

import com.vn.shopping.domain.UserRole;
import com.vn.shopping.service.UserRoleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/user_role")
public class UserRoleController {
    private final UserRoleService service;

    public UserRoleController(UserRoleService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<UserRoleResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @PostMapping

    public ResponseEntity<UserRoleResponse> create(@RequestBody UserRoleRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.save(body)));
    }

    @PutMapping
    public ResponseEntity<UserRoleResponse> update(@RequestBody UserRoleRequest body) {
        return ResponseEntity.ok(response(service.save(body)));
    }

    @DeleteMapping

    public ResponseEntity<Void> delete(@RequestBody UserRoleRequest body) {
        service.deleteBody(body);
        return ResponseEntity.noContent().build();
    }

    private List<UserRoleResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(UserRoleResponse::new).toList();
    }

    private UserRoleResponse response(Object value) {
        return new UserRoleResponse(DtoMapper.toMap(value));
    }
}