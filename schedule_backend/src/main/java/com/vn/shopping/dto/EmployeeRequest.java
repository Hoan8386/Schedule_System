package com.vn.shopping.dto;

import java.time.LocalDate;
import java.util.Map;

public record EmployeeRequest(Integer userId, String employeeCode, String fullName,
                              LocalDate dateOfBirth, String gender, String email,
                              String phone, String address, LocalDate hireDate,
                              String status, String note, Map<String, Object> user) {
    public Integer resolvedUserId() {
        if (userId != null) {
            return userId;
        }
        Object id = user == null ? null : user.get("id");
        return id instanceof Number number ? number.intValue() : null;
    }
}
