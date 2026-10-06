package com.vn.shopping.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "role_permission")
@IdClass(RolePermissionId.class)
@Getter
@Setter
@NoArgsConstructor
public class RolePermission {
    @Id
    @Column(name = "role_id", nullable = false)
    private Integer roleId;
    @Id
    @Column(name = "permission_id", nullable = false)
    private Integer permissionId;
}

