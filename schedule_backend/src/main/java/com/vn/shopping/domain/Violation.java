package com.vn.shopping.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "violation")
@Getter
@Setter
@NoArgsConstructor
public class Violation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "violation_id")
    private Integer violationId;
    @Column(name = "rule_id", nullable = false)
    private Integer ruleId;
    @Column(name = "disciplinary_code_id", nullable = false)
    private Integer disciplinaryCodeId;
    @Column(name = "attendance_id")
    private Integer attendanceId;
    @Column(name = "violation_time", nullable = false)
    private LocalDateTime violationTime;
    @Column(name = "description")
    private String description;
    @Column(name = "evidence_id")
    private Integer evidenceId;
    @Column(name = "rule_name", nullable = false)
    private String ruleName;
    @Column(name = "category")
    private String category;
    @Column(name = "rule_description")
    private String ruleDescription;
    @Column(name = "penalty_type")
    private String penaltyType;
    @Column(name = "penalty_amount")
    private BigDecimal penaltyAmount;
    @Column(name = "status", nullable = false)
    private String status;
    @Column(name = "created_by")
    private Integer createdBy;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}

