package com.vn.shopping.controller;

import com.vn.shopping.dto.*;
import com.vn.shopping.dto.DtoMapper;

import com.vn.shopping.domain.TestOption;
import com.vn.shopping.service.TestOptionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/test_option")
public class TestOptionController {
    private final TestOptionService service;

    public TestOptionController(TestOptionService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<TestOptionResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TestOptionResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    public ResponseEntity<TestOptionResponse> create(@RequestBody TestOptionRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TestOptionResponse> update(@PathVariable Integer id, @RequestBody TestOptionRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<TestOptionResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(TestOptionResponse::new).toList();
    }

    private TestOptionResponse response(Object value) {
        return new TestOptionResponse(DtoMapper.toMap(value));
    }
}