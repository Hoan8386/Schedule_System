package com.vn.shopping.controller;

import com.vn.shopping.dto.*;
import com.vn.shopping.dto.DtoMapper;

import com.vn.shopping.domain.NotificationTemplate;
import com.vn.shopping.service.NotificationTemplateService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/notification_template")
public class NotificationTemplateController {
    private final NotificationTemplateService service;

    public NotificationTemplateController(NotificationTemplateService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<NotificationTemplateResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotificationTemplateResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    public ResponseEntity<NotificationTemplateResponse> create(@RequestBody NotificationTemplateRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NotificationTemplateResponse> update(@PathVariable Integer id,
            @RequestBody NotificationTemplateRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<NotificationTemplateResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(NotificationTemplateResponse::new).toList();
    }

    private NotificationTemplateResponse response(Object value) {
        return new NotificationTemplateResponse(DtoMapper.toMap(value));
    }
}