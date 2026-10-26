package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.vn.schedule.domain.UserRole;
import com.vn.schedule.domain.UserRoleId;
import java.util.List;

public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleId> {
    List<UserRole> findByUserId(Integer userId);

    /** Mã vai trò của tài khoản trong một truy vấn (theo role_id, cùng thứ tự đọc user_role theo khóa chính). */
    @Query("""
            SELECT r.roleCode FROM UserRole ur, Role r
            WHERE r.roleId = ur.roleId AND ur.userId = :userId
            ORDER BY ur.roleId
            """)
    List<String> findRoleCodesByUserId(@Param("userId") Integer userId);

    /** [userId, roleCode] của nhiều tài khoản trong một truy vấn (xác định vị trí nhân viên theo trang). */
    @Query("""
            SELECT ur.userId, r.roleCode FROM UserRole ur, Role r
            WHERE r.roleId = ur.roleId AND ur.userId IN :userIds
            """)
    List<Object[]> findRoleCodesByUserIds(@Param("userIds") java.util.Collection<Integer> userIds);

    /** Số tài khoản ACTIVE mang vai trò roleId, không tính excludeUserId (null = tính tất cả). */
    @Query("""
            SELECT COUNT(u) FROM User u
            WHERE UPPER(u.status) = 'ACTIVE'
              AND (:excludeUserId IS NULL OR u.id <> :excludeUserId)
              AND u.id IN (SELECT ur.userId FROM UserRole ur WHERE ur.roleId = :roleId)
            """)
    long countActiveUsersWithRole(@Param("roleId") Integer roleId, @Param("excludeUserId") Integer excludeUserId);
}
