package com.vn.shopping.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employee_store")
@Getter
@Setter
@NoArgsConstructor
public class EmployeeStore {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "employee_store_id")
    private Integer employeeStoreId;
    @Column(name = "employee_id", nullable = false)
    private Integer employeeId;
    @Column(name = "store_id", nullable = false)
    private Integer storeId;
    @Column(name = "start_date")
    private LocalDate startDate;
    @Column(name = "end_date")
    private LocalDate endDate;
    @Column(name = "is_primary")
    private Boolean isPrimary;
    @Column(name = "status")
    private String status;
    @Column(name = "assigned_by")
    private Integer assignedBy;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}

