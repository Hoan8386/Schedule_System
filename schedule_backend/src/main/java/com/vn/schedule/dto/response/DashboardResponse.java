package com.vn.schedule.dto.response;

import com.vn.schedule.dto.response.StatisticsResponse.StoreOption;
import com.vn.schedule.dto.response.StatisticsResponse.StoreStat;
import com.vn.schedule.dto.response.StatisticsResponse.Summary;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/** DTO trang tổng quan của quản lý, trưởng cửa hàng và nhân viên. */
public final class DashboardResponse {
    private DashboardResponse() {
    }

    /** requestType: REGISTER (đăng ký ca chờ duyệt) / CHANGE / ADD / CANCEL. */
    public record RequestItem(
            Integer id,
            String requestType,
            Integer employeeId,
            String employeeCode,
            String employeeName,
            String storeName,
            String workDate,
            String shiftName,
            String startTime,
            String endTime,
            String reason,
            String requestedAt,
            String status) {
    }

    public record ViolationItem(
            Integer id,
            String employeeName,
            String storeName,
            String violationTime,
            String title,
            String description,
            BigDecimal penaltyAmount,
            String status) {
    }

    public record TodoItem(Integer id, String title, String description, String priority, String dueAt, String status) {
    }

    public record ShiftItem(
            Integer assignmentId,
            String workDate,
            String shiftName,
            String startTime,
            String endTime,
            String storeName,
            double plannedHours,
            BigDecimal payRate,
            BigDecimal estimatedWage,
            String workStatus) {
    }

    public record NotificationItem(Integer id, String title, String content, String type, String createdAt, boolean read) {
    }

    public record AttendanceDay(String date, int onTime, int late, int absent) {
    }

    public record RoundItem(Integer id, String roundName, String storeName, String registrationStartAt, String registrationEndAt) {
    }

    public record Manager(
            String from,
            String to,
            long activeStores,
            long totalStores,
            long activeEmployees,
            int todayShifts,
            long pendingAssignments,
            long pendingRequests,
            Summary month,
            List<AttendanceDay> attendanceTrend,
            /** Số yêu cầu đổi/hủy ca trong tháng theo trạng thái */
            Map<String, Long> requestStatus,
            List<StoreStat> byStore,
            List<RequestItem> recentRequests,
            List<ViolationItem> recentViolations,
            long newViolations,
            List<TodoItem> todos) {
    }

    public record StoreManager(
            String from,
            String to,
            String managerName,
            List<StoreOption> stores,
            Summary month,
            int todayShifts,
            long pendingRegistrations,
            long pendingChanges,
            long pendingCancels,
            List<RequestItem> requestQueue,
            ShiftItem myNextShift,
            List<TodoItem> todos,
            List<RoundItem> openRounds,
            List<AttendanceDay> attendanceTrend) {
    }

    public record Employee(
            String from,
            String to,
            String employeeName,
            Summary month,
            ShiftItem nextShift,
            List<ShiftItem> weekShifts,
            List<RequestItem> pendingRequests,
            List<NotificationItem> notifications,
            long unreadNotifications,
            List<RoundItem> openRounds) {
    }
}
