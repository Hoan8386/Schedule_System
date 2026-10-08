package com.vn.schedule.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record AttendanceResponse(
        Integer id,
        EmployeeSummary employee,
        Integer employeeId,
        ShiftByDateSummary shiftByDate,
        Integer shiftByDateId,
        LocalDateTime checkInAt,
        BigDecimal checkInLatitude,
        BigDecimal checkInLongitude,
        BigDecimal checkInAccuracy,
        Integer attachmentId,
        LocalDateTime checkOutAt,
        BigDecimal checkOutLatitude,
        BigDecimal checkOutLongitude,
        BigDecimal checkOutAccuracy,
        BigDecimal workedHours,
        String attendanceStatus,
        String scheduleMatchStatus,
        String approvalStatus,
        Integer approvedBy,
        LocalDateTime approvedAt,
        String note,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {

    public record EmployeeSummary(
            Integer id,
            String employeeCode,
            String fullName,
            String email,
            String phone) {
    }

    public record ShiftByDateSummary(
            Integer id,
            String shiftName,
            LocalDate workDate,
            LocalTime startTime,
            LocalTime endTime,
            String status) {
    }
}
