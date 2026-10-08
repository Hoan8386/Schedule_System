package com.vn.schedule.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vn.schedule.domain.EmployeeWorkSummary;
import com.vn.schedule.dto.*;
import com.vn.schedule.dto.request.*;
import com.vn.schedule.dto.response.*;
import com.vn.schedule.service.EmployeeWorkSummaryService;

import java.util.List;
import com.vn.schedule.util.anotation.ApiMessage;

@RestController
@RequestMapping("/api/v1/employee_work_summary")
public class EmployeeWorkSummaryController {
    private final EmployeeWorkSummaryService service;

    public EmployeeWorkSummaryController(EmployeeWorkSummaryService service) {
        this.service = service;
    }

    @GetMapping
    @ApiMessage("Lấy danh sách dữ liệu")
    public ResponseEntity<List<EmployeeWorkSummaryResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    @ApiMessage("Lấy thông tin chi tiết")
    public ResponseEntity<EmployeeWorkSummaryResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    @ApiMessage("Tạo mới dữ liệu")
    public ResponseEntity<EmployeeWorkSummaryResponse> create(@RequestBody EmployeeWorkSummaryRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    @ApiMessage("Cập nhật dữ liệu")
    public ResponseEntity<EmployeeWorkSummaryResponse> update(@PathVariable Integer id, @RequestBody EmployeeWorkSummaryRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    @ApiMessage("Xóa dữ liệu")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<EmployeeWorkSummaryResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(value -> new EmployeeWorkSummaryResponse(DtoMapper.toMap(value))).toList();
    }

    private EmployeeWorkSummaryResponse response(Object value) {
        return new EmployeeWorkSummaryResponse(DtoMapper.toMap(value));
    }
}
