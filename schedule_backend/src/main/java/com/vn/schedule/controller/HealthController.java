package com.vn.schedule.controller;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vn.schedule.dto.response.HealthResponse;

import java.time.Instant;
import com.vn.schedule.util.anotation.ApiMessage;

@RestController
public class HealthController {
    @GetMapping("/health")
    @ApiMessage("Kiểm tra trạng thái hệ thống")
    public ResponseEntity<HealthResponse> health() {
        return ResponseEntity.ok(new HealthResponse("UP", Instant.now().toString()));
    }
}
