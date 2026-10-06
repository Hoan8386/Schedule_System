package com.vn.shopping.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "role")
@Getter
@Setter
@NoArgsConstructor
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_id")
    private Integer roleId;
    @Column(name = "role_code", nullable = false, unique = true)
    private String roleCode;
    @Column(name = "role_name", nullable = false)
    private String roleName;
    @Column(name = "description")
    private String description;
    @Column(name = "status")
    private String status;
}

