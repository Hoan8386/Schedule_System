package com.vn.schedule.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "disciplinary_record")
@Getter
@Setter
@NoArgsConstructor
public class DisciplinaryRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "disciplinary_id")
    private Integer disciplinaryId;
    @Column(name = "store_id")
    private Integer storeId;
    @Column(name = "employee_id", nullable = false)
    private Integer employeeId;
    @Column(name = "disciplinary_type", nullable = false)
    private String disciplinaryType;
    @Column(name = "amount")
    private BigDecimal amount;
    @Column(name = "reason")
    private String reason;
    @Column(name = "status", nullable = false)
    private String status;
    @Column(name = "created_by")
    private Integer createdBy;
    @Column(name = "approved_by")
    private Integer approvedBy;
    @Column(name = "approved_at")
    private LocalDateTime approvedAt;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}

