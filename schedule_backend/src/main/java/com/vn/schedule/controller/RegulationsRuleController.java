package com.vn.schedule.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vn.schedule.domain.RegulationsRule;
import com.vn.schedule.dto.*;
import com.vn.schedule.service.RegulationsRuleService;

import java.util.List;
import com.vn.schedule.util.anotation.ApiMessage;

@RestController
@RequestMapping("/regulations_rule")
public class RegulationsRuleController {
    private final RegulationsRuleService service;

    public RegulationsRuleController(RegulationsRuleService service) {
        this.service = service;
    }

    @GetMapping
    @ApiMessage("Lấy danh sách dữ liệu")
    public ResponseEntity<List<RegulationsRuleResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    @ApiMessage("Lấy thông tin chi tiết")
    public ResponseEntity<RegulationsRuleResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    @ApiMessage("Tạo mới dữ liệu")
    public ResponseEntity<RegulationsRuleResponse> create(@RequestBody RegulationsRuleRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    @ApiMessage("Cập nhật dữ liệu")
    public ResponseEntity<RegulationsRuleResponse> update(@PathVariable Integer id, @RequestBody RegulationsRuleRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    @ApiMessage("Xóa dữ liệu")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<RegulationsRuleResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(RegulationsRuleResponse::new).toList();
    }

    private RegulationsRuleResponse response(Object value) {
        return new RegulationsRuleResponse(DtoMapper.toMap(value));
    }
}
