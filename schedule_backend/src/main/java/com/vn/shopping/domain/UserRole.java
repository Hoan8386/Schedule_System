package com.vn.shopping.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_role")
@IdClass(UserRoleId.class)
@Getter
@Setter
@NoArgsConstructor
public class UserRole {
    @Id
    @Column(name = "user_id", nullable = false)
    private Integer userId;
    @Id
    @Column(name = "role_id", nullable = false)
    private Integer roleId;
    @Column(name = "assigned_by")
    private Integer assignedBy;
    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;
}

