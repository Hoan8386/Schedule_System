package com.vn.schedule.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employee_evaluation")
@Getter
@Setter
@NoArgsConstructor
public class EmployeeEvaluation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "evaluation_id")
    private Integer evaluationId;
    @Column(name = "evaluator_id", nullable = false)
    private Integer evaluatorId;
    @Column(name = "employee_id", nullable = false)
    private Integer employeeId;
    @Column(name = "store_id")
    private Integer storeId;
    @Column(name = "shift_by_date_id")
    private Integer shiftByDateId;
    @Column(name = "period_start")
    private LocalDate periodStart;
    @Column(name = "period_end")
    private LocalDate periodEnd;
    @Column(name = "total_score")
    private BigDecimal totalScore;
    @Column(name = "final_rating")
    private String finalRating;
    @Column(name = "status", nullable = false)
    private String status;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}

