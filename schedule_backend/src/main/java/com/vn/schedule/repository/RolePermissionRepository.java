package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.RolePermission;
import com.vn.schedule.domain.RolePermissionId;
import java.util.List;

public interface RolePermissionRepository extends JpaRepository<RolePermission, RolePermissionId> {
    List<RolePermission> findByRoleIdIn(List<Integer> roleIds);

    boolean existsByRoleIdAndPermissionId(Integer roleId, Integer permissionId);
}
