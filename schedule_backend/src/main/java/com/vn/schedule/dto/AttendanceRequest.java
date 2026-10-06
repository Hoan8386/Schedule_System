package com.vn.schedule.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

public record AttendanceRequest(Integer employeeId, Integer shiftByDateId,
                                LocalDateTime checkOutAt, String attendanceStatus,
                                String approvalStatus, String note,
                                BigDecimal checkInLatitude, BigDecimal checkInLongitude,
                                Map<String, Object> employee) {
    public Integer resolvedEmployeeId() {
        if (employeeId != null) {
            return employeeId;
        }
        Object id = employee == null ? null : employee.get("id");
        return id instanceof Number number ? number.intValue() : null;
    }
}
