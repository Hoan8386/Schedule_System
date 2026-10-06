package com.vn.shopping.controller;

import com.vn.shopping.dto.DtoMapper;

import com.vn.shopping.domain.RolePermission;
import com.vn.shopping.service.RolePermissionService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/role_permission")
public class RolePermissionController {
    private final RolePermissionService service;
    public RolePermissionController(RolePermissionService service) { this.service = service; }
    @GetMapping public List<Map<String,Object>> list() { return DtoMapper.toList(service.findAll()); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> create(@RequestBody Map<String,Object> body) { return DtoMapper.toMap(service.save(body)); }
    @PutMapping public Map<String,Object> update(@RequestBody Map<String,Object> body) { return DtoMapper.toMap(service.save(body)); }
    @DeleteMapping @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@RequestBody Map<String,Object> body) { service.deleteBody(body); }
}

