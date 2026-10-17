package com.vn.schedule.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "shift_assignment",
       uniqueConstraints = @UniqueConstraint(name = "uk_shift_assignment", columnNames = {"shift_by_date_id", "employee_id"}))
@Getter
@Setter
@NoArgsConstructor
public class ShiftAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "assignment_id")
    private Integer id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "shift_by_date_id", nullable = false)
    private ShiftByDate shiftByDate;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;
    @Column(nullable = false)
    private String status;
    @Column(name = "registered_at")
    private LocalDateTime registeredAt;
    @Column(name = "approved_by")
    private Integer approvedBy;
    @Column(name = "approved_at")
    private LocalDateTime approvedAt;
    @Column(name = "cancelled_by")
    private Integer cancelledBy;
    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;
    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;
    private String note;
}

