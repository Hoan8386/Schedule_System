package com.vn.shopping.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "test_result")
@Getter
@Setter
@NoArgsConstructor
public class TestResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "test_result_id")
    private Integer testResultId;
    @Column(name = "test_assignment_id", nullable = false)
    private Integer testAssignmentId;
    @Column(name = "score")
    private BigDecimal score;
    @Column(name = "passed")
    private Boolean passed;
    @Column(name = "started_at")
    private LocalDateTime startedAt;
    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;
    @Column(name = "graded_by")
    private Integer gradedBy;
    @Column(name = "graded_at")
    private LocalDateTime gradedAt;
}

