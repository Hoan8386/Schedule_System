package com.vn.schedule.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record ShiftByDateResponse(
        Integer id,
        ShiftSummary shift,
        Integer shiftId,
        SchedulePeriodSummary schedulePeriod,
        Integer schedulePeriodId,
        LocalDate workDate,
        Integer capacity,
        String shiftName,
        LocalTime startTime,
        LocalTime endTime,
        Integer maxCapacity,
        BigDecimal payRate,
        String status,
        String managerNote) {

    public record ShiftSummary(
            Integer id,
            String shiftCode,
            String shiftName,
            LocalTime startTime,
            LocalTime endTime,
            Integer maxCapacity,
            BigDecimal payRate,
            String status) {
    }

    public record SchedulePeriodSummary(
            Integer id,
            String periodName,
            String periodType,
            LocalDate startDate,
            LocalDate endDate,
            String status,
            LocalDateTime registrationOpenAt,
            LocalDateTime registrationCloseAt) {
    }
}
