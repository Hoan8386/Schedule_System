package com.vn.schedule.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "shift_by_date",
       uniqueConstraints = @UniqueConstraint(name = "uk_shift_by_date", columnNames = {"shift_id", "work_date"}))
@Getter
@Setter
@NoArgsConstructor
public class ShiftByDate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "shift_by_date_id")
    private Integer id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "shift_id", nullable = false)
    private Shift shift;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_period_id")
    private SchedulePeriod schedulePeriod;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_round_id")
    private ScheduleRound scheduleRound;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_session_id")
    private ScheduleSession scheduleSession;
    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;
    private Integer capacity;
    private String shiftName;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer maxCapacity;
    @Column(name = "pay_rate", precision = 15, scale = 2)
    private BigDecimal payRate;
    @Column(nullable = false)
    private String status;
    @Column(name = "manager_note", columnDefinition = "TEXT")
    private String managerNote;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

