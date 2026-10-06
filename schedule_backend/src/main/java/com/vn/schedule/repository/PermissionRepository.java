package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.Permission;
import java.util.Optional;

public interface PermissionRepository extends JpaRepository<Permission, Integer> {
    boolean existsByPermissionIdInAndApiPathAndMethod(
            java.util.Collection<Integer> permissionIds, String apiPath, String method);

    Optional<Permission> findByApiPathAndMethod(String apiPath, String method);
}
