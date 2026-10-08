package com.vn.schedule.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vn.schedule.domain.DisciplinaryRecord;
import com.vn.schedule.dto.*;
import com.vn.schedule.dto.request.*;
import com.vn.schedule.dto.response.*;
import com.vn.schedule.service.DisciplinaryRecordService;

import java.util.List;
import com.vn.schedule.util.anotation.ApiMessage;

@RestController
@RequestMapping("/api/v1/disciplinary_record")
public class DisciplinaryRecordController {
    private final DisciplinaryRecordService service;

    public DisciplinaryRecordController(DisciplinaryRecordService service) {
        this.service = service;
    }

    @GetMapping
    @ApiMessage("Lấy danh sách dữ liệu")
    public ResponseEntity<List<DisciplinaryRecordResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    @ApiMessage("Lấy thông tin chi tiết")
    public ResponseEntity<DisciplinaryRecordResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    @ApiMessage("Tạo mới dữ liệu")
    public ResponseEntity<DisciplinaryRecordResponse> create(@RequestBody DisciplinaryRecordRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    @ApiMessage("Cập nhật dữ liệu")
    public ResponseEntity<DisciplinaryRecordResponse> update(@PathVariable Integer id, @RequestBody DisciplinaryRecordRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    @ApiMessage("Xóa dữ liệu")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<DisciplinaryRecordResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(value -> new DisciplinaryRecordResponse(DtoMapper.toMap(value))).toList();
    }

    private DisciplinaryRecordResponse response(Object value) {
        return new DisciplinaryRecordResponse(DtoMapper.toMap(value));
    }
}
