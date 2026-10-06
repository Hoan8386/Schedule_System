package com.vn.shopping.controller;

import com.vn.shopping.dto.*;
import com.vn.shopping.dto.DtoMapper;

import com.vn.shopping.domain.Test;
import com.vn.shopping.service.TestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/test")
public class TestController {
    private final TestService service;

    public TestController(TestService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<TestResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TestResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    public ResponseEntity<TestResponse> create(@RequestBody TestRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TestResponse> update(@PathVariable Integer id, @RequestBody TestRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<TestResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(TestResponse::new).toList();
    }

    private TestResponse response(Object value) {
        return new TestResponse(DtoMapper.toMap(value));
    }
}