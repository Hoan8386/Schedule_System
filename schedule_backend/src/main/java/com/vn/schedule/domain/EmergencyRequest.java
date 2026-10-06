package com.vn.schedule.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "emergency_request")
@Getter
@Setter
@NoArgsConstructor
public class EmergencyRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "emergency_request_id")
    private Integer emergencyRequestId;
    @Column(name = "employee_id", nullable = false)
    private Integer employeeId;
    @Column(name = "assignment_id")
    private Integer assignmentId;
    @Column(name = "request_type", nullable = false)
    private String requestType;
    @Column(name = "from_shift_assignment_id")
    private Integer fromShiftAssignmentId;
    @Column(name = "to_assignment_id")
    private Integer toAssignmentId;
    @Column(name = "reason", nullable = false)
    private String reason;
    @Column(name = "status", nullable = false)
    private String status;
    @Column(name = "requested_at")
    private LocalDateTime requestedAt;
    @Column(name = "processed_by")
    private Integer processedBy;
    @Column(name = "processed_at")
    private LocalDateTime processedAt;
    @Column(name = "process_note")
    private String processNote;
}

