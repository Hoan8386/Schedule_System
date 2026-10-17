package com.vn.schedule.dto.response;

import java.util.List;

/**
 * Một trang thông báo của người dùng hiện tại.
 * Dùng cờ hasMore (Slice) thay vì tổng số bản ghi để tránh câu COUNT trên bảng lớn.
 */
public record NotificationPageResponse(
        List<NotificationResponse> items,
        int page,
        int size,
        boolean hasMore,
        long unreadCount) {
}
