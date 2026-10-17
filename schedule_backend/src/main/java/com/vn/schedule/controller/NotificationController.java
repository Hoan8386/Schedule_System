package com.vn.schedule.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vn.schedule.domain.Notification;
import com.vn.schedule.dto.*;
import com.vn.schedule.dto.request.*;
import com.vn.schedule.dto.response.*;
import com.vn.schedule.service.NotificationService;

import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Slice;
import com.vn.schedule.util.anotation.ApiMessage;

@RestController
@RequestMapping("/api/v1/notification")
public class NotificationController {
    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    @GetMapping
    @ApiMessage("Lấy danh sách dữ liệu")
    public ResponseEntity<List<NotificationResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    // ---------- Thông báo của người dùng đang đăng nhập (chuông thông báo) ----------

    /** status = unread | read; tối đa 20 thông báo mỗi trang (page bắt đầu từ 0). */
    @GetMapping("/me")
    @ApiMessage("Lấy thông báo của tôi")
    public ResponseEntity<NotificationPageResponse> mine(
            @RequestParam(defaultValue = "unread") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "" + NotificationService.MAX_PAGE_SIZE) int size) {
        Slice<Notification> slice = service.findMine("read".equalsIgnoreCase(status), page, size);
        return ResponseEntity.ok(new NotificationPageResponse(
                responses(slice.getContent()), slice.getNumber(), slice.getSize(), slice.hasNext(), service.countMyUnread()));
    }

    @GetMapping("/me/unread-count")
    @ApiMessage("Đếm thông báo chưa đọc")
    public ResponseEntity<Map<String, Long>> myUnreadCount() {
        return ResponseEntity.ok(Map.of("unreadCount", service.countMyUnread()));
    }

    @PatchMapping("/me/{id}/read")
    @ApiMessage("Đánh dấu đã đọc")
    public ResponseEntity<NotificationResponse> markRead(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.markMineAsRead(id)));
    }

    @PatchMapping("/me/read-all")
    @ApiMessage("Đánh dấu tất cả đã đọc")
    public ResponseEntity<Map<String, Integer>> markAllRead() {
        return ResponseEntity.ok(Map.of("updated", service.markAllMineAsRead()));
    }

    // ---------- CRUD quản trị ----------

    @GetMapping("/{id}")
    @ApiMessage("Lấy thông tin chi tiết")
    public ResponseEntity<NotificationResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @PostMapping

    @ApiMessage("Tạo mới dữ liệu")
    public ResponseEntity<NotificationResponse> create(@RequestBody NotificationRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    @ApiMessage("Cập nhật dữ liệu")
    public ResponseEntity<NotificationResponse> update(@PathVariable Integer id, @RequestBody NotificationRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    @ApiMessage("Xóa dữ liệu")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<NotificationResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(value -> new NotificationResponse(DtoMapper.toMap(value))).toList();
    }

    private NotificationResponse response(Object value) {
        return new NotificationResponse(DtoMapper.toMap(value));
    }
}
