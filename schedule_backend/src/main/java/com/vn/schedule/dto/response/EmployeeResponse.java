package com.vn.schedule.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record EmployeeResponse(
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
        /** EMPLOYEE / STORE_MANAGER (theo vai trò tài khoản) */
        String position) {
}
