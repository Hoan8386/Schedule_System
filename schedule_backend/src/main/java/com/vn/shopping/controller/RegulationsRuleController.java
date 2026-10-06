package com.vn.shopping.controller;

import com.vn.shopping.dto.*;
import com.vn.shopping.dto.DtoMapper;

import com.vn.shopping.domain.RegulationsRule;
import com.vn.shopping.service.RegulationsRuleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/regulations_rule")
public class RegulationsRuleController {
    private final RegulationsRuleService service;

    public RegulationsRuleController(RegulationsRuleService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<RegulationsRuleResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RegulationsRuleResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    public ResponseEntity<RegulationsRuleResponse> create(@RequestBody RegulationsRuleRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RegulationsRuleResponse> update(@PathVariable Integer id, @RequestBody RegulationsRuleRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

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