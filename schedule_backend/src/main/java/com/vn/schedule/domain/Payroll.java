package com.vn.schedule.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "payroll")
@Getter
@Setter
@NoArgsConstructor
public class Payroll {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payroll_id")
    private Integer payrollId;
    @Column(name = "employee_id", nullable = false)
    private Integer employeeId;
    @Column(name = "store_id")
    private Integer storeId;
    @Column(name = "payroll_month", nullable = false)
    private LocalDate payrollMonth;
    @Column(name = "base_amount")
    private BigDecimal baseAmount;
    @Column(name = "bonus_amount")
    private BigDecimal bonusAmount;
    @Column(name = "penalty_amount")
    private BigDecimal penaltyAmount;
    @Column(name = "total_amount")
    private BigDecimal totalAmount;
    @Column(name = "status", nullable = false)
    private String status;
    @Column(name = "created_by")
    private Integer createdBy;
    @Column(name = "approved_by")
    private Integer approvedBy;
    @Column(name = "approved_at")
    private LocalDateTime approvedAt;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}

