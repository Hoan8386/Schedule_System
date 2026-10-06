package com.vn.schedule.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedback")
@Getter
@Setter
@NoArgsConstructor
public class Feedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "feedback_id")
    private Integer feedbackId;
    @Column(name = "employee_id", nullable = false)
    private Integer employeeId;
    @Column(name = "store_id")
    private Integer storeId;
    @Column(name = "shift_by_date_id")
    private Integer shiftByDateId;
    @Column(name = "feedback_type", nullable = false)
    private String feedbackType;
    @Column(name = "target_employee_id")
    private Integer targetEmployeeId;
    @Column(name = "rating")
    private BigDecimal rating;
    @Column(name = "content", nullable = false)
    private String content;
    @Column(name = "status", nullable = false)
    private String status;
    @Column(name = "handled_by")
    private Integer handledBy;
    @Column(name = "handled_at")
    private LocalDateTime handledAt;
    @Column(name = "response")
    private String response;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}

