package com.vn.schedule.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance")
@Getter
@Setter
@NoArgsConstructor
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attendance_id")
    private Integer id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shift_by_date_id")
    private ShiftByDate shiftByDate;
    private LocalDateTime checkInAt;
    private BigDecimal checkInLatitude;
    private BigDecimal checkInLongitude;
    private BigDecimal checkInAccuracy;
    @Column(name = "attachment_id")
    private Integer attachmentId;
    private LocalDateTime checkOutAt;
    private BigDecimal checkOutLatitude;
    private BigDecimal checkOutLongitude;
    private BigDecimal checkOutAccuracy;
    private BigDecimal workedHours;
    @Column(name = "attendance_status", nullable = false)
    private String attendanceStatus;
    @Column(name = "schedule_match_status", nullable = false)
    private String scheduleMatchStatus;
    @Column(name = "approval_status", nullable = false)
    private String approvalStatus;
    @Column(name = "approved_by")
    private Integer approvedBy;
    private LocalDateTime approvedAt;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

