package com.vn.schedule.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.vn.schedule.domain.User;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);

    /**
     * Trang quản lý tài khoản: mỗi dòng [User, Role] với vai trò hiện tại là vai trò có role_id nhỏ nhất
     * (giống cách frontend cũ lấy liên kết user_role đầu tiên). Tài khoản chưa có vai trò được coi là EMPLOYEE.
     */
    @Query(value = """
            SELECT u, r FROM User u
            LEFT JOIN Role r ON r.roleId = (SELECT MIN(ur.roleId) FROM UserRole ur WHERE ur.userId = u.id)
            WHERE (:keyword IS NULL OR u.username LIKE :keyword OR u.email LIKE :keyword
                   OR u.phone LIKE :keyword OR CAST(u.id AS string) LIKE :keyword)
              AND (:locked IS NULL OR (:locked = TRUE AND u.status <> 'ACTIVE') OR (:locked = FALSE AND u.status = 'ACTIVE'))
              AND (:roleCode IS NULL OR r.roleCode = :roleCode OR (:roleCode = 'EMPLOYEE' AND r.roleId IS NULL))
            """,
            countQuery = """
            SELECT COUNT(u) FROM User u
            LEFT JOIN Role r ON r.roleId = (SELECT MIN(ur.roleId) FROM UserRole ur WHERE ur.userId = u.id)
            WHERE (:keyword IS NULL OR u.username LIKE :keyword OR u.email LIKE :keyword
                   OR u.phone LIKE :keyword OR CAST(u.id AS string) LIKE :keyword)
              AND (:locked IS NULL OR (:locked = TRUE AND u.status <> 'ACTIVE') OR (:locked = FALSE AND u.status = 'ACTIVE'))
              AND (:roleCode IS NULL OR r.roleCode = :roleCode OR (:roleCode = 'EMPLOYEE' AND r.roleId IS NULL))
            """)
    Page<Object[]> searchAccounts(@Param("keyword") String keyword,
                                  @Param("locked") Boolean locked,
                                  @Param("roleCode") String roleCode,
                                  Pageable pageable);

    /** [tổng, quản lý + trưởng cửa hàng, nhân viên (kể cả chưa gán vai trò), bị khóa, quản lý đang hoạt động]. */
    @Query("""
            SELECT COUNT(u),
                   COALESCE(SUM(CASE WHEN r.roleCode IN ('MANAGER', 'STORE_MANAGER') THEN 1 ELSE 0 END), 0),
                   COALESCE(SUM(CASE WHEN r.roleCode = 'EMPLOYEE' OR r.roleId IS NULL THEN 1 ELSE 0 END), 0),
                   COALESCE(SUM(CASE WHEN u.status <> 'ACTIVE' THEN 1 ELSE 0 END), 0),
                   COALESCE(SUM(CASE WHEN r.roleCode = 'MANAGER' AND u.status = 'ACTIVE' THEN 1 ELSE 0 END), 0)
            FROM User u
            LEFT JOIN Role r ON r.roleId = (SELECT MIN(ur.roleId) FROM UserRole ur WHERE ur.userId = u.id)
            """)
    List<Object[]> accountSummary();
}
