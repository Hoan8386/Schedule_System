package com.vn.shopping.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "test")
@Getter
@Setter
@NoArgsConstructor
public class Test {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "test_id")
    private Integer testId;
    @Column(name = "test_code", nullable = false, unique = true)
    private String testCode;
    @Column(name = "test_name", nullable = false)
    private String testName;
    @Column(name = "description")
    private String description;
    @Column(name = "target_role_id")
    private Integer targetRoleId;
    @Column(name = "duration_minutes")
    private Integer durationMinutes;
    @Column(name = "passing_score")
    private BigDecimal passingScore;
    @Column(name = "status", nullable = false)
    private String status;
    @Column(name = "created_by")
    private Integer createdBy;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}

