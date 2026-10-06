package com.vn.shopping.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bonus_record")
@Getter
@Setter
@NoArgsConstructor
public class BonusRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bonus_record_id")
    private Integer bonusRecordId;
    @Column(name = "employee_id", nullable = false)
    private Integer employeeId;
    @Column(name = "payroll_month", nullable = false)
    private LocalDate payrollMonth;
    @Column(name = "total_bonus", nullable = false)
    private BigDecimal totalBonus;
    @Column(name = "total_penalty", nullable = false)
    private BigDecimal totalPenalty;
    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;
    @Column(name = "status", nullable = false)
    private String status;
    @Column(name = "created_by", nullable = false)
    private Integer createdBy;
    @Column(name = "approved_by")
    private Integer approvedBy;
    @Column(name = "approved_at")
    private LocalDateTime approvedAt;
}

