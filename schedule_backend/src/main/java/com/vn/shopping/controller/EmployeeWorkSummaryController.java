package com.vn.shopping.controller;

import com.vn.shopping.dto.*;
import com.vn.shopping.dto.DtoMapper;

import com.vn.shopping.domain.EmployeeWorkSummary;
import com.vn.shopping.service.EmployeeWorkSummaryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/employee_work_summary")
public class EmployeeWorkSummaryController {
    private final EmployeeWorkSummaryService service;

    public EmployeeWorkSummaryController(EmployeeWorkSummaryService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<EmployeeWorkSummaryResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeWorkSummaryResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    public ResponseEntity<EmployeeWorkSummaryResponse> create(@RequestBody EmployeeWorkSummaryRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeWorkSummaryResponse> update(@PathVariable Integer id, @RequestBody EmployeeWorkSummaryRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<EmployeeWorkSummaryResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(EmployeeWorkSummaryResponse::new).toList();
    }

    private EmployeeWorkSummaryResponse response(Object value) {
        return new EmployeeWorkSummaryResponse(DtoMapper.toMap(value));
    }
}