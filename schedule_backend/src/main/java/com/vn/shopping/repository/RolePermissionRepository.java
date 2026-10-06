package com.vn.shopping.repository;

import com.vn.shopping.domain.RolePermission;
import com.vn.shopping.domain.RolePermissionId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RolePermissionRepository extends JpaRepository<RolePermission, RolePermissionId> {
}

