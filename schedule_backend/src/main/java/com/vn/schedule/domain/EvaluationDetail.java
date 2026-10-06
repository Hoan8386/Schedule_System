package com.vn.schedule.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "evaluation_detail")
@Getter
@Setter
@NoArgsConstructor
public class EvaluationDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "evaluation_detail_id")
    private Integer evaluationDetailId;
    @Column(name = "evaluation_id", nullable = false)
    private Integer evaluationId;
    @Column(name = "criteria_id", nullable = false)
    private Integer criteriaId;
    @Column(name = "score")
    private BigDecimal score;
    @Column(name = "actual_value")
    private BigDecimal actualValue;
    @Column(name = "target_value")
    private BigDecimal targetValue;
    @Column(name = "exceeded_value")
    private BigDecimal exceededValue;
    @Column(name = "comment")
    private String comment;
}

