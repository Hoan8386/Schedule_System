package com.vn.schedule.dto.response;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO thống kê cho quản lý, trưởng cửa hàng và nhân viên.
 * Ngày/giờ trả về dạng chuỗi ISO (yyyy-MM-dd, HH:mm, yyyy-MM-dd'T'HH:mm).
 */
public final class StatisticsResponse {
    private StatisticsResponse() {
    }

    public record StoreOption(Integer storeId, String storeName) {
    }

    public record Summary(
            int employees,
            int stores,
            int scheduledShifts,
            int completedShifts,
            int pendingShifts,
            int upcomingShifts,
            int lateCount,
            int absentCount,
            double totalHours,
            BigDecimal totalWage,
            int violationCount,
            BigDecimal totalPenalty,
            Double averageScore,
            double attendanceRate) {
    }

    public record StoreStat(
            Integer storeId,
            String storeName,
            int employees,
            int scheduledShifts,
            int completedShifts,
            int lateCount,
            int absentCount,
            double totalHours,
            BigDecimal totalWage,
            int violationCount,
            double attendanceRate) {
    }

    public record DailyStat(String date, int shifts, double hours, BigDecimal wage) {
    }

    public record EmployeeStat(
            Integer employeeId,
            String employeeCode,
            String fullName,
            String stores,
            int scheduledShifts,
            int completedShifts,
            int lateCount,
            int absentCount,
            double totalHours,
            BigDecimal totalWage,
            int violationCount,
            BigDecimal totalPenalty,
            Double averageScore,
            double attendanceRate) {
    }

    public record ShiftRow(
            Integer assignmentId,
            Integer shiftByDateId,
            Integer employeeId,
            String employeeCode,
            String employeeName,
            Integer storeId,
            String storeName,
            String workDate,
            String shiftName,
            String startTime,
            String endTime,
            String assignmentStatus,
            String attendanceStatus,
            String checkInAt,
            String checkOutAt,
            double hours,
            BigDecimal payRate,
            BigDecimal wage,
            /** COMPLETED / IN_PROGRESS / ABSENT / UPCOMING / PENDING / CANCELLED */
            String workStatus) {
    }

    public record PayrollInfo(
            BigDecimal recordedWage,
            BigDecimal approvedPayroll,
            BigDecimal paidPayroll,
            BigDecimal bonusAmount,
            BigDecimal penaltyAmount) {
    }

    /** Thống kê nhiều nhân viên / cửa hàng (quản lý, trưởng cửa hàng). */
    public record Overview(
            String from,
            String to,
            List<StoreOption> stores,
            Summary summary,
            List<StoreStat> byStore,
            List<DailyStat> daily,
            List<EmployeeStat> employees) {
    }

    /** Thống kê cá nhân của nhân viên đang đăng nhập. */
    public record Personal(
            String from,
            String to,
            Integer employeeId,
            String employeeName,
            List<StoreOption> stores,
            Summary summary,
            List<DailyStat> daily,
            List<ShiftRow> shifts,
            PayrollInfo payroll) {
    }
}
