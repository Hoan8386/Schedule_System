package com.vn.schedule.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "shift_by_date")
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
    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;
    private Integer capacity;
    private String shiftName;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer maxCapacity;
    private BigDecimal payRate;
    @Column(nullable = false)
    private String status;
    private String managerNote;
}

