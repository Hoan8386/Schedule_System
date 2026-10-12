package com.vn.schedule.dto.request;

import java.time.LocalDate;
import java.util.Map;

public record EmployeeRequest(Integer userId, String employeeCode, String fullName,
                              String avatar,
                              LocalDate dateOfBirth, String gender, String email,
                              String phone, String address,
                              Integer idCardFrontId, Integer idCardBackId,
                              LocalDate hireDate,
                              String status, String note, Map<String, Object> user) {
    public Integer resolvedUserId() {
        if (userId != null && userId > 0) {
            return userId;
        }
        Object id = user == null ? null : user.get("id");
        if (id instanceof Number number && number.intValue() > 0) {
            return number.intValue();
        }
        return null;
    }
}
