package com.vn.schedule.dto.response;

import java.time.LocalDateTime;
import java.util.List;

/** Trang quản lý tài khoản: tài khoản kèm vai trò hiện tại (không trả mật khẩu) và số liệu thẻ thống kê. */
public record AccountPageResponse(ResultPaginationDTO.Meta meta, List<Item> result, Summary summary) {

    public record Item(
            Integer id,
            String username,
            String email,
            String phone,
            String status,
            LocalDateTime lastLoginAt,
            LocalDateTime createdAt,
            Integer roleId,
            String roleCode,
            String roleName) {
    }

    /** activeManagers: số tài khoản MANAGER đang hoạt động (frontend chặn khóa quản lý cuối cùng). */
    public record Summary(long total, long managers, long employees, long locked, long activeManagers) {
    }
}
