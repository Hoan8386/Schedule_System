package com.vn.shopping.controller;

import com.vn.shopping.dto.*;
import com.vn.shopping.dto.DtoMapper;

import com.vn.shopping.domain.TestQuestion;
import com.vn.shopping.service.TestQuestionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/test_question")
public class TestQuestionController {
    private final TestQuestionService service;

    public TestQuestionController(TestQuestionService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<TestQuestionResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TestQuestionResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    public ResponseEntity<TestQuestionResponse> create(@RequestBody TestQuestionRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TestQuestionResponse> update(@PathVariable Integer id, @RequestBody TestQuestionRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<TestQuestionResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(TestQuestionResponse::new).toList();
    }

    private TestQuestionResponse response(Object value) {
        return new TestQuestionResponse(DtoMapper.toMap(value));
    }
}