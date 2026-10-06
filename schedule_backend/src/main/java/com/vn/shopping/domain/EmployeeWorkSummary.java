package com.vn.shopping.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employee_work_summary")
@Getter
@Setter
@NoArgsConstructor
public class EmployeeWorkSummary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "summary_id")
    private Integer summaryId;
    @Column(name = "employee_id", nullable = false)
    private Integer employeeId;
    @Column(name = "store_id")
    private Integer storeId;
    @Column(name = "period_start")
    private LocalDate periodStart;
    @Column(name = "period_end")
    private LocalDate periodEnd;
    @Column(name = "total_shifts")
    private Integer totalShifts;
    @Column(name = "total_worked_hours")
    private BigDecimal totalWorkedHours;
    @Column(name = "total_scheduled_hours")
    private BigDecimal totalScheduledHours;
    @Column(name = "average_hours_per_shift")
    private BigDecimal averageHoursPerShift;
    @Column(name = "total_late_minutes")
    private Integer totalLateMinutes;
    @Column(name = "total_early_leave_minutes")
    private Integer totalEarlyLeaveMinutes;
    @Column(name = "attendance_rate")
    private BigDecimal attendanceRate;
    @Column(name = "target_value")
    private BigDecimal targetValue;
    @Column(name = "actual_value")
    private BigDecimal actualValue;
    @Column(name = "exceeded_value")
    private BigDecimal exceededValue;
    @Column(name = "evaluation_score")
    private BigDecimal evaluationScore;
    @Column(name = "calculated_at")
    private LocalDateTime calculatedAt;
}

