package com.vn.shopping.controller;

import com.vn.shopping.dto.DtoMapper;

import com.vn.shopping.domain.UserRole;
import com.vn.shopping.service.UserRoleService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/user_role")
public class UserRoleController {
    private final UserRoleService service;
    public UserRoleController(UserRoleService service) { this.service = service; }
    @GetMapping public List<Map<String,Object>> list() { return DtoMapper.toList(service.findAll()); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> create(@RequestBody Map<String,Object> body) { return DtoMapper.toMap(service.save(body)); }
    @PutMapping public Map<String,Object> update(@RequestBody Map<String,Object> body) { return DtoMapper.toMap(service.save(body)); }
    @DeleteMapping @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@RequestBody Map<String,Object> body) { service.deleteBody(body); }
}

