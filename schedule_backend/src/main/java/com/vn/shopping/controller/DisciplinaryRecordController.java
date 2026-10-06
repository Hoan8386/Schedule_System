package com.vn.shopping.controller;

import com.vn.shopping.dto.*;
import com.vn.shopping.dto.DtoMapper;

import com.vn.shopping.domain.DisciplinaryRecord;
import com.vn.shopping.service.DisciplinaryRecordService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/disciplinary_record")
public class DisciplinaryRecordController {
    private final DisciplinaryRecordService service;

    public DisciplinaryRecordController(DisciplinaryRecordService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<DisciplinaryRecordResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DisciplinaryRecordResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    public ResponseEntity<DisciplinaryRecordResponse> create(@RequestBody DisciplinaryRecordRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DisciplinaryRecordResponse> update(@PathVariable Integer id, @RequestBody DisciplinaryRecordRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<DisciplinaryRecordResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(DisciplinaryRecordResponse::new).toList();
    }

    private DisciplinaryRecordResponse response(Object value) {
        return new DisciplinaryRecordResponse(DtoMapper.toMap(value));
    }
}