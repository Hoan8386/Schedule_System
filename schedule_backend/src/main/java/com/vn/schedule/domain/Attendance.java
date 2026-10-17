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
    @Column(name = "check_in_at")
    private LocalDateTime checkInAt;
    @Column(name = "check_in_latitude")
    private BigDecimal checkInLatitude;
    @Column(name = "check_in_longitude")
    private BigDecimal checkInLongitude;
    @Column(name = "check_in_accuracy")
    private BigDecimal checkInAccuracy;
    @Column(name = "attachment_id")
    private Integer attachmentId;
    @Column(name = "check_out_at")
    private LocalDateTime checkOutAt;
    @Column(name = "check_out_latitude")
    private BigDecimal checkOutLatitude;
    @Column(name = "check_out_longitude")
    private BigDecimal checkOutLongitude;
    @Column(name = "check_out_accuracy")
    private BigDecimal checkOutAccuracy;
    @Column(name = "worked_hours")
    private BigDecimal workedHours;
    @Column(name = "attendance_status", nullable = false)
    private String attendanceStatus;
    @Column(name = "schedule_match_status", nullable = false)
    private String scheduleMatchStatus;
    @Column(name = "approval_status", nullable = false)
    private String approvalStatus;
    @Column(name = "approved_by")
    private Integer approvedBy;
    @Column(name = "approved_at")
    private LocalDateTime approvedAt;
    private String note;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

