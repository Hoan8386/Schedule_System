package com.vn.shopping.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "evaluation_criteria")
@Getter
@Setter
@NoArgsConstructor
public class EvaluationCriteria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "criteria_id")
    private Integer criteriaId;
    @Column(name = "criteria_code", nullable = false, unique = true)
    private String criteriaCode;
    @Column(name = "criteria_name", nullable = false)
    private String criteriaName;
    @Column(name = "criteria_type", nullable = false)
    private String criteriaType;
    @Column(name = "description")
    private String description;
    @Column(name = "target_value")
    private BigDecimal targetValue;
    @Column(name = "period_type")
    private String periodType;
    @Column(name = "max_score")
    private BigDecimal maxScore;
    @Column(name = "weight")
    private BigDecimal weight;
    @Column(name = "status", nullable = false)
    private String status;
    @Column(name = "created_by")
    private Integer createdBy;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}

