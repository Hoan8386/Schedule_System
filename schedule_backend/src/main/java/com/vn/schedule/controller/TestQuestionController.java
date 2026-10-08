package com.vn.schedule.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vn.schedule.domain.TestQuestion;
import com.vn.schedule.dto.*;
import com.vn.schedule.service.TestQuestionService;

import java.util.List;
import com.vn.schedule.util.anotation.ApiMessage;

@RestController
@RequestMapping("/api/v1/test_question")
public class TestQuestionController {
    private final TestQuestionService service;

    public TestQuestionController(TestQuestionService service) {
        this.service = service;
    }

    @GetMapping
    @ApiMessage("Lấy danh sách dữ liệu")
    public ResponseEntity<List<TestQuestionResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    @ApiMessage("Lấy thông tin chi tiết")
    public ResponseEntity<TestQuestionResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    @ApiMessage("Tạo mới dữ liệu")
    public ResponseEntity<TestQuestionResponse> create(@RequestBody TestQuestionRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    @ApiMessage("Cập nhật dữ liệu")
    public ResponseEntity<TestQuestionResponse> update(@PathVariable Integer id, @RequestBody TestQuestionRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    @ApiMessage("Xóa dữ liệu")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<TestQuestionResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(value -> new TestQuestionResponse(DtoMapper.toMap(value))).toList();
    }

    private TestQuestionResponse response(Object value) {
        return new TestQuestionResponse(DtoMapper.toMap(value));
    }
}
