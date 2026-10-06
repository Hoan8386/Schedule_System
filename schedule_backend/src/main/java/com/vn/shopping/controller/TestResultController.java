package com.vn.shopping.controller;

import com.vn.shopping.dto.*;
import com.vn.shopping.dto.DtoMapper;

import com.vn.shopping.domain.TestResult;
import com.vn.shopping.service.TestResultService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/test_result")
public class TestResultController {
    private final TestResultService service;

    public TestResultController(TestResultService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<TestResultResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TestResultResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    public ResponseEntity<TestResultResponse> create(@RequestBody TestResultRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TestResultResponse> update(@PathVariable Integer id, @RequestBody TestResultRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<TestResultResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(TestResultResponse::new).toList();
    }

    private TestResultResponse response(Object value) {
        return new TestResultResponse(DtoMapper.toMap(value));
    }
}