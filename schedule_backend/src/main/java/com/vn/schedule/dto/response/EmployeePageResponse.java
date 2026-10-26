package com.vn.schedule.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Trang danh sách nhân sự: một request trả về đủ dữ liệu hiển thị
 * (hồ sơ, cửa hàng phân bổ kèm tên, cờ quản lý) và số liệu tổng cho các thẻ thống kê.
 */
public record EmployeePageResponse(ResultPaginationDTO.Meta meta, List<Item> result, Summary summary) {

    public record Item(
            Integer id,
            Integer userId,
            String employeeCode,
            String fullName,
            String avatar,
            LocalDate dateOfBirth,
            String gender,
            String email,
            String phone,
            String address,
            Integer idCardFrontId,
            Integer idCardBackId,
            Integer signatureId,
            LocalDate hireDate,
            String status,
            String note,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            boolean manager,
            /** EMPLOYEE / STORE_MANAGER (theo vai trò tài khoản) */
            String position,
            List<Assignment> assignments) {
    }

    /** Cùng tên trường với /api/v1/employee_store, thêm storeName. */
    public record Assignment(
            Integer employeeStoreId,
            Integer employeeId,
            Integer storeId,
            String storeName,
            LocalDate startDate,
            LocalDate endDate,
            Boolean isPrimary,
            String status,
            Integer assignedBy,
            LocalDateTime createdAt) {
    }

    /** total / active / managers (vị trí trưởng cửa hàng): theo phạm vi + bộ lọc trạng thái. */
    public record Summary(long total, long active, long managers) {
    }
}
