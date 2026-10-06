package com.vn.schedule.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payroll_detail")
@Getter
@Setter
@NoArgsConstructor
public class PayrollDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payroll_detail_id")
    private Integer payrollDetailId;
    @Column(name = "payroll_id", nullable = false)
    private Integer payrollId;
    @Column(name = "shift_by_date_id")
    private Integer shiftByDateId;
    @Column(name = "attendance_id")
    private Integer attendanceId;
    @Column(name = "bonus_record_id", nullable = false)
    private Integer bonusRecordId;
    @Column(name = "violation_id")
    private Integer violationId;
    @Column(name = "item_type", nullable = false)
    private String itemType;
    @Column(name = "description")
    private String description;
    @Column(name = "amount", nullable = false)
    private BigDecimal amount;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}

