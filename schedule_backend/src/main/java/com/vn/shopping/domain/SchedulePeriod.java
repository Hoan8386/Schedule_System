package com.vn.shopping.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "schedule_period")
@Getter
@Setter
@NoArgsConstructor
public class SchedulePeriod {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "schedule_period_id")
    private Integer id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;
    @Column(name = "period_name", nullable = false)
    private String periodName;
    @Column(name = "period_type", nullable = false)
    private String periodType;
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;
    private LocalDateTime registrationOpenAt;
    private LocalDateTime registrationCloseAt;
    @Column(name = "status", nullable = false)
    private String status;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "created_by")
    private Integer createdBy;
    @Column(name = "finalized_by")
    private Integer finalizedBy;
    @Column(name = "finalized_at")
    private LocalDateTime finalizedAt;
}

