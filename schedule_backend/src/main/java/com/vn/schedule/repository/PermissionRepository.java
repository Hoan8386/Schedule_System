package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.vn.schedule.domain.Permission;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface PermissionRepository extends JpaRepository<Permission, Integer> {
    boolean existsByPermissionIdInAndApiPathAndMethod(
            java.util.Collection<Integer> permissionIds, String apiPath, String method);

    List<Permission> findByPermissionIdIn(Collection<Integer> permissionIds);

    Optional<Permission> findByApiPathAndMethod(String apiPath, String method);

    /** Tài khoản có quyền gọi endpoint (qua bất kỳ vai trò nào) – một truy vấn thay cho user_role → role_permission → permission. */
    @Query("""
            SELECT COUNT(p) > 0 FROM Permission p, RolePermission rp, UserRole ur
            WHERE rp.permissionId = p.permissionId
              AND ur.roleId = rp.roleId
              AND ur.userId = :userId
              AND p.apiPath = :apiPath
              AND p.method = :method
            """)
    boolean existsForUser(@Param("userId") Integer userId, @Param("apiPath") String apiPath,
                          @Param("method") String method);
}
