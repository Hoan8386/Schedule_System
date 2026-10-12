package com.vn.schedule.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "shift_group",
       uniqueConstraints = @UniqueConstraint(name = "uk_shift_group_store_code", columnNames = {"store_id", "shift_group_code"}))
@Getter @Setter @NoArgsConstructor
public class ShiftGroup {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "shift_group_id")
    private Integer id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "store_id", nullable = false) private Store store;
    @Column(name = "shift_group_code", nullable = false) private String shiftGroupCode;
    @Column(name = "shift_group_name", nullable = false) private String shiftGroupName;
    private String description;
    @Column(name = "pay_rate", precision = 15, scale = 2) private BigDecimal payRate;
    @Column(nullable = false) private String status;
    @Column(name = "created_by") private Integer createdBy;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @Column(name = "updated_at") private LocalDateTime updatedAt;
}
