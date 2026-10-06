package com.vn.shopping.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "test_assignment")
@Getter
@Setter
@NoArgsConstructor
public class TestAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "test_assignment_id")
    private Integer testAssignmentId;
    @Column(name = "test_id", nullable = false)
    private Integer testId;
    @Column(name = "employee_id", nullable = false)
    private Integer employeeId;
    @Column(name = "assigned_by")
    private Integer assignedBy;
    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;
    @Column(name = "due_at")
    private LocalDateTime dueAt;
    @Column(name = "status", nullable = false)
    private String status;
}

