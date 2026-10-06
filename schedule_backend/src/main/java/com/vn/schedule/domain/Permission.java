package com.vn.schedule.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "permission")
@Getter
@Setter
@NoArgsConstructor
public class Permission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "permission_id")
    private Integer permissionId;
    @Column(name = "permission_code", nullable = false, unique = true)
    private String permissionCode;
    @Column(name = "permission_name", nullable = false)
    private String permissionName;
    @Column(name = "description")
    private String description;
}

