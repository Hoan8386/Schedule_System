package com.vn.schedule.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vn.schedule.domain.NotificationTemplateVariable;
import com.vn.schedule.dto.*;
import com.vn.schedule.service.NotificationTemplateVariableService;

import java.util.List;
import com.vn.schedule.util.anotation.ApiMessage;

@RestController
@RequestMapping("/api/v1/notification_template_variable")
public class NotificationTemplateVariableController {
    private final NotificationTemplateVariableService service;

    public NotificationTemplateVariableController(NotificationTemplateVariableService service) {
        this.service = service;
    }

    @GetMapping
    @ApiMessage("Lấy danh sách dữ liệu")
    public ResponseEntity<List<NotificationTemplateVariableResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @PostMapping

    @ApiMessage("Tạo mới dữ liệu")
    public ResponseEntity<NotificationTemplateVariableResponse> create(@RequestBody NotificationTemplateVariableRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.save(body)));
    }

    @PutMapping
    @ApiMessage("Cập nhật dữ liệu")
    public ResponseEntity<NotificationTemplateVariableResponse> update(@RequestBody NotificationTemplateVariableRequest body) {
        return ResponseEntity.ok(response(service.save(body)));
    }

    @DeleteMapping

    @ApiMessage("Xóa dữ liệu")
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
