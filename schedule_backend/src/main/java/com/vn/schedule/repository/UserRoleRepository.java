package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.vn.schedule.domain.UserRole;
import com.vn.schedule.domain.UserRoleId;
import java.util.List;

public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleId> {
    List<UserRole> findByUserId(Integer userId);

    /** Số tài khoản ACTIVE mang vai trò roleId, không tính excludeUserId (null = tính tất cả). */
    @Query("""
            SELECT COUNT(u) FROM User u
            WHERE UPPER(u.status) = 'ACTIVE'
              AND (:excludeUserId IS NULL OR u.id <> :excludeUserId)
              AND u.id IN (SELECT ur.userId FROM UserRole ur WHERE ur.roleId = :roleId)
            """)
    long countActiveUsersWithRole(@Param("roleId") Integer roleId, @Param("excludeUserId") Integer excludeUserId);
}
