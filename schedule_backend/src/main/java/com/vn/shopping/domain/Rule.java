package com.vn.shopping.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "rule")
@Getter
@Setter
@NoArgsConstructor
public class Rule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rule_id")
    private Integer ruleId;
    @Column(name = "rule_code", nullable = false, unique = true)
    private String ruleCode;
    @Column(name = "rule_name", nullable = false)
    private String ruleName;
    @Column(name = "category")
    private String category;
    @Column(name = "description")
    private String description;
    @Column(name = "penalty_type")
    private String penaltyType;
    @Column(name = "penalty_amount")
    private BigDecimal penaltyAmount;
    @Column(name = "status", nullable = false)
    private String status;
    @Column(name = "created_by")
    private Integer createdBy;
    @Column(name = "updated_by")
    private Integer updatedBy;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

