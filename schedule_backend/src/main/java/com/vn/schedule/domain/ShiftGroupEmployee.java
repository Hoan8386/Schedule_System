package com.vn.schedule.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

/** Nhân viên thuộc một nhóm ca (nhân viên phải làm việc tại cửa hàng của nhóm ca). */
@Entity
@Table(name = "shift_group_employee",
       uniqueConstraints = @UniqueConstraint(name = "uk_shift_group_employee", columnNames = {"shift_group_id", "employee_id"}))
@Getter @Setter @NoArgsConstructor
public class ShiftGroupEmployee {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "shift_group_employee_id")
    private Integer id;
    @Column(name = "shift_group_id", nullable = false) private Integer shiftGroupId;
    @Column(name = "employee_id", nullable = false) private Integer employeeId;
    @Column(name = "assigned_by") private Integer assignedBy;
    @Column(name = "assigned_at") private LocalDateTime assignedAt;

    public ShiftGroupEmployee(Integer shiftGroupId, Integer employeeId, Integer assignedBy) {
        this.shiftGroupId = shiftGroupId;
        this.employeeId = employeeId;
        this.assignedBy = assignedBy;
        this.assignedAt = LocalDateTime.now();
    }
}
