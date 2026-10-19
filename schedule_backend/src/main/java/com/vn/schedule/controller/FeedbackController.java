package com.vn.schedule.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vn.schedule.dto.request.*;
import com.vn.schedule.dto.response.*;
import com.vn.schedule.service.FeedbackService;

import java.util.List;
import com.vn.schedule.util.anotation.ApiMessage;

@RestController
@RequestMapping("/api/v1/feedback")
public class FeedbackController {
    private final FeedbackService service;

    public FeedbackController(FeedbackService service) {
        this.service = service;
    }

    /** Danh sách phản hồi theo phạm vi của người dùng hiện tại. */
    @GetMapping
    @ApiMessage("Lấy danh sách phản hồi")
    public ResponseEntity<List<FeedbackResponse>> list() {
        return ResponseEntity.ok(service.list().stream().map(FeedbackResponse::new).toList());
    }

    /** Đồng nghiệp cùng cửa hàng – dùng cho phản hồi loại Đồng nghiệp. */
    @GetMapping("/colleagues")
    @ApiMessage("Lấy danh sách đồng nghiệp")
    public ResponseEntity<List<java.util.Map<String, Object>>> colleagues() {
        return ResponseEntity.ok(service.colleagues());
    }

    @GetMapping("/{id}")
    @ApiMessage("Lấy thông tin phản hồi")
    public ResponseEntity<FeedbackResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(new FeedbackResponse(service.get(id)));
    }

    @PostMapping
    @ApiMessage("Đã gửi phản hồi")
    public ResponseEntity<FeedbackResponse> create(@RequestBody FeedbackRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(new FeedbackResponse(service.create(body)));
    }

    /** Chuyển trạng thái phản hồi (kèm ghi chú trả lời tùy chọn). Body: { status, response? } */
    @PutMapping("/{id}")
    @ApiMessage("Đã cập nhật phản hồi")
    public ResponseEntity<FeedbackResponse> reply(@PathVariable Integer id, @RequestBody FeedbackRequest body) {
        return ResponseEntity.ok(new FeedbackResponse(service.reply(id, body)));
    }
}
