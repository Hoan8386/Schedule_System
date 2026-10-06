package com.vn.schedule.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "store_manager")
@Getter
@Setter
@NoArgsConstructor
public class StoreManager {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "store_manager_id")
    private Integer storeManagerId;
    @Column(name = "store_id", nullable = false)
    private Integer storeId;
    @Column(name = "employee_id", nullable = false)
    private Integer employeeId;
    @Column(name = "start_date")
    private LocalDate startDate;
    @Column(name = "end_date")
    private LocalDate endDate;
    @Column(name = "status")
    private String status;
    @Column(name = "assigned_by")
    private Integer assignedBy;
    @Column(name = "note")
    private String note;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}

