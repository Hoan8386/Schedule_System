package com.vn.shopping.controller;

import com.vn.shopping.dto.*;
import com.vn.shopping.dto.DtoMapper;

import com.vn.shopping.domain.Attachment;
import com.vn.shopping.service.AttachmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/attachment")
public class AttachmentController {
    private final AttachmentService service;

    public AttachmentController(AttachmentService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<AttachmentResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AttachmentResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    public ResponseEntity<AttachmentResponse> create(@RequestBody AttachmentRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AttachmentResponse> update(@PathVariable Integer id, @RequestBody AttachmentRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<AttachmentResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(AttachmentResponse::new).toList();
    }

    private AttachmentResponse response(Object value) {
        return new AttachmentResponse(DtoMapper.toMap(value));
    }
}