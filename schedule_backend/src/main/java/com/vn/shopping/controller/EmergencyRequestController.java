package com.vn.shopping.controller;

import com.vn.shopping.dto.*;
import com.vn.shopping.dto.DtoMapper;

import com.vn.shopping.domain.EmergencyRequest;
import com.vn.shopping.service.EmergencyRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/emergency_request")
public class EmergencyRequestController {
    private final EmergencyRequestService service;

    public EmergencyRequestController(EmergencyRequestService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<EmergencyRequestResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmergencyRequestResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    public ResponseEntity<EmergencyRequestResponse> create(@RequestBody EmergencyRequestRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmergencyRequestResponse> update(@PathVariable Integer id, @RequestBody EmergencyRequestRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<EmergencyRequestResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(EmergencyRequestResponse::new).toList();
    }

    private EmergencyRequestResponse response(Object value) {
        return new EmergencyRequestResponse(DtoMapper.toMap(value));
    }
}