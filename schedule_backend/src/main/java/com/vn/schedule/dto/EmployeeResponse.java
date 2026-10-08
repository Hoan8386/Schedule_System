package com.vn.schedule.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record EmployeeResponse(
        Integer id,
        Integer userId,
        String employeeCode,
        String fullName,
        LocalDate dateOfBirth,
        String gender,
        String email,
        String phone,
        String address,
        Integer idCardFrontId,
        Integer idCardBackId,
        LocalDate hireDate,
        String status,
        String note,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}
