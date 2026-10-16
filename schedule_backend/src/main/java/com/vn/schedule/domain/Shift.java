package com.vn.schedule.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "shift",
       uniqueConstraints = @UniqueConstraint(name = "uk_shift_group_code", columnNames = {"shift_group_id", "shift_code"}))
@Getter
@Setter
@NoArgsConstructor
public class Shift {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "shift_id")
    private Integer id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shift_group_id")
    private ShiftGroup shiftGroup;
    @Column(name = "shift_code", nullable = false)
    private String shiftCode;
    @Column(name = "shift_name", nullable = false)
    private String shiftName;
    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;
    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;
    @Column(name = "max_capacity")
    private Integer maxCapacity;
    @Column(name = "pay_rate", precision = 15, scale = 2)
    private BigDecimal payRate;
    @Column(name = "status", nullable = false)
    private String status;
    @Column(name = "note")
    private String note;
    @Column(name = "created_by")
    private Integer createdBy;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

