package com.vn.schedule.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vn.schedule.service.BroadcastService;
import com.vn.schedule.util.anotation.ApiMessage;

import java.util.List;

/** Phát thông báo trong ứng dụng tới nhân sự (quản lý / trưởng cửa hàng). */
@RestController
@RequestMapping("/api/v1/notification/broadcast")
public class BroadcastController {
    private final BroadcastService service;

    public BroadcastController(BroadcastService service) {
        this.service = service;
    }

    /** Danh sách cửa hàng trong phạm vi và số người nhận theo từng đối tượng. */
    @GetMapping("/audiences")
    @ApiMessage("Lấy đối tượng nhận thông báo")
    public ResponseEntity<BroadcastService.Audiences> audiences(@RequestParam(required = false) Integer storeId) {
        return ResponseEntity.ok(service.audiences(storeId));
    }

    @PostMapping
    @ApiMessage("Phát thông báo")
    public ResponseEntity<BroadcastService.BroadcastResult> broadcast(@RequestBody BroadcastService.BroadcastRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.broadcast(body));
    }

    @GetMapping("/history")
    @ApiMessage("Lấy lịch sử phát thông báo")
    public ResponseEntity<List<BroadcastService.BroadcastHistory>> history(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(service.history(limit));
    }
}
