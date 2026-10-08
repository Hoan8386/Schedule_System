package com.vn.schedule.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vn.schedule.domain.NotificationTemplate;
import com.vn.schedule.dto.*;
import com.vn.schedule.service.NotificationTemplateService;

import java.util.List;
import com.vn.schedule.util.anotation.ApiMessage;

@RestController
@RequestMapping("/api/v1/notification_template")
public class NotificationTemplateController {
    private final NotificationTemplateService service;

    public NotificationTemplateController(NotificationTemplateService service) {
        this.service = service;
    }

    @GetMapping
    @ApiMessage("Lấy danh sách dữ liệu")
    public ResponseEntity<List<NotificationTemplateResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    @ApiMessage("Lấy thông tin chi tiết")
    public ResponseEntity<NotificationTemplateResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    @ApiMessage("Tạo mới dữ liệu")
    public ResponseEntity<NotificationTemplateResponse> create(@RequestBody NotificationTemplateRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    @ApiMessage("Cập nhật dữ liệu")
    public ResponseEntity<NotificationTemplateResponse> update(@PathVariable Integer id,
            @RequestBody NotificationTemplateRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    @ApiMessage("Xóa dữ liệu")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<NotificationTemplateResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(value -> new NotificationTemplateResponse(DtoMapper.toMap(value))).toList();
    }

    private NotificationTemplateResponse response(Object value) {
        return new NotificationTemplateResponse(DtoMapper.toMap(value));
    }
}
