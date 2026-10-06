package com.vn.shopping.controller;

import com.vn.shopping.dto.*;
import com.vn.shopping.dto.DtoMapper;

import com.vn.shopping.domain.NotificationTemplateVariable;
import com.vn.shopping.service.NotificationTemplateVariableService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/notification_template_variable")
public class NotificationTemplateVariableController {
    private final NotificationTemplateVariableService service;

    public NotificationTemplateVariableController(NotificationTemplateVariableService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<NotificationTemplateVariableResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @PostMapping

    public ResponseEntity<NotificationTemplateVariableResponse> create(@RequestBody NotificationTemplateVariableRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.save(body)));
    }

    @PutMapping
    public ResponseEntity<NotificationTemplateVariableResponse> update(@RequestBody NotificationTemplateVariableRequest body) {
        return ResponseEntity.ok(response(service.save(body)));
    }

    @DeleteMapping

    public ResponseEntity<Void> delete(@RequestBody NotificationTemplateVariableRequest body) {
        service.deleteBody(body);
        return ResponseEntity.noContent().build();
    }

    private List<NotificationTemplateVariableResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(NotificationTemplateVariableResponse::new).toList();
    }

    private NotificationTemplateVariableResponse response(Object value) {
        return new NotificationTemplateVariableResponse(DtoMapper.toMap(value));
    }
}