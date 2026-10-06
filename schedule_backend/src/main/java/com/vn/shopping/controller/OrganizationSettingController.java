package com.vn.shopping.controller;

import com.vn.shopping.dto.*;
import com.vn.shopping.dto.DtoMapper;

import com.vn.shopping.domain.OrganizationSetting;
import com.vn.shopping.service.OrganizationSettingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/organization_setting")
public class OrganizationSettingController {
    private final OrganizationSettingService service;

    public OrganizationSettingController(OrganizationSettingService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<OrganizationSettingResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrganizationSettingResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    public ResponseEntity<OrganizationSettingResponse> create(@RequestBody OrganizationSettingRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrganizationSettingResponse> update(@PathVariable Integer id, @RequestBody OrganizationSettingRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<OrganizationSettingResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(OrganizationSettingResponse::new).toList();
    }

    private OrganizationSettingResponse response(Object value) {
        return new OrganizationSettingResponse(DtoMapper.toMap(value));
    }
}