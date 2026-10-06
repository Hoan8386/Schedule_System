package com.vn.shopping.controller;

import com.vn.shopping.dto.*;
import com.vn.shopping.dto.DtoMapper;

import com.vn.shopping.domain.SystemConfig;
import com.vn.shopping.service.SystemConfigService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/system_config")
public class SystemConfigController {
    private final SystemConfigService service;

    public SystemConfigController(SystemConfigService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<SystemConfigResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SystemConfigResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    public ResponseEntity<SystemConfigResponse> create(@RequestBody SystemConfigRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SystemConfigResponse> update(@PathVariable Integer id, @RequestBody SystemConfigRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<SystemConfigResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(SystemConfigResponse::new).toList();
    }

    private SystemConfigResponse response(Object value) {
        return new SystemConfigResponse(DtoMapper.toMap(value));
    }
}