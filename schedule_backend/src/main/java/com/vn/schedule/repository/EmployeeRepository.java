package com.vn.schedule.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.vn.schedule.domain.Employee;

import java.util.Collection;
import java.util.List;

/**
 * Phạm vi nhân viên dùng chung cho các truy vấn bên dưới:
 * selfId != null: chỉ chính mình; allStores = false: chỉ nhân viên đang ACTIVE ở một trong visibleStoreIds
 * (EXISTS theo cửa hàng thay vì truyền danh sách hàng nghìn id nhân viên).
 */
public interface EmployeeRepository extends JpaRepository<Employee, Integer> {
    List<Employee> findByStatusOrderByFullName(String status);
    java.util.Optional<Employee> findByUser_Id(Integer userId);

    @Query("""
            SELECT e FROM Employee e
            WHERE (:status IS NULL OR e.status = :status)
              AND (:selfId IS NULL OR e.id = :selfId)
              AND (:allStores = TRUE OR EXISTS (SELECT 1 FROM EmployeeStore vs
                    WHERE vs.employeeId = e.id AND vs.storeId IN :visibleStoreIds AND UPPER(vs.status) = 'ACTIVE'))
            """)
    List<Employee> findInScope(@Param("status") String status,
                               @Param("selfId") Integer selfId,
                               @Param("allStores") boolean allStores,
                               @Param("visibleStoreIds") Collection<Integer> visibleStoreIds,
                               Sort sort);

    /**
     * Trang nhân sự: phạm vi + trạng thái + từ khóa (mã, tên, điện thoại, email; collation *_ci nên không phân biệt hoa thường
     * và dấu thanh) + điều kiện phân bổ cửa hàng (chỉ khi assignmentFilter = true).
     */
    @Query("""
            SELECT e FROM Employee e
            WHERE (:status IS NULL OR e.status = :status)
              AND (:selfId IS NULL OR e.id = :selfId)
              AND (:allStores = TRUE OR EXISTS (SELECT 1 FROM EmployeeStore vs
                    WHERE vs.employeeId = e.id AND vs.storeId IN :visibleStoreIds AND UPPER(vs.status) = 'ACTIVE'))
              AND (:keyword IS NULL OR e.employeeCode LIKE :keyword OR e.fullName LIKE :keyword
                   OR e.phone LIKE :keyword OR e.email LIKE :keyword)
              AND (:assignmentFilter = FALSE OR EXISTS (SELECT 1 FROM EmployeeStore es
                    WHERE es.employeeId = e.id
                      AND (:allStores = TRUE OR es.storeId IN :visibleStoreIds)
                      AND (:storeId IS NULL OR es.storeId = :storeId)
                      AND (:assignmentStatus IS NULL OR es.status = :assignmentStatus)
                      AND (:primary IS NULL OR es.isPrimary = :primary)
                      AND (:role IS NULL
                           OR (:role = 'MANAGER' AND EXISTS (SELECT 1 FROM StoreManager sm
                                WHERE sm.employeeId = es.employeeId AND sm.storeId = es.storeId
                                  AND (:assignmentStatus IS NULL OR sm.status = :assignmentStatus)))
                           OR (:role = 'EMPLOYEE' AND NOT EXISTS (SELECT 1 FROM StoreManager sm
                                WHERE sm.employeeId = es.employeeId AND sm.storeId = es.storeId
                                  AND (:assignmentStatus IS NULL OR sm.status = :assignmentStatus))))))
              AND (:position IS NULL
                   OR (:position = 'STORE_MANAGER' AND EXISTS (SELECT 1 FROM UserRole ur, Role r
                        WHERE ur.userId = e.user.id AND r.roleId = ur.roleId AND r.roleCode = 'STORE_MANAGER'))
                   OR (:position = 'EMPLOYEE' AND NOT EXISTS (SELECT 1 FROM UserRole ur, Role r
                        WHERE ur.userId = e.user.id AND r.roleId = ur.roleId AND r.roleCode = 'STORE_MANAGER')))
            """)
    Page<Employee> searchPage(@Param("status") String status,
                              @Param("selfId") Integer selfId,
                              @Param("allStores") boolean allStores,
                              @Param("visibleStoreIds") Collection<Integer> visibleStoreIds,
                              @Param("keyword") String keyword,
                              @Param("assignmentFilter") boolean assignmentFilter,
                              @Param("storeId") Integer storeId,
                              @Param("assignmentStatus") String assignmentStatus,
                              @Param("primary") Boolean primary,
                              @Param("role") String role,
                              @Param("position") String position,
                              Pageable pageable);

    /** [tổng, đang ACTIVE] trong phạm vi + bộ lọc trạng thái – một truy vấn cho các thẻ thống kê. */
    @Query("""
            SELECT COUNT(e), COALESCE(SUM(CASE WHEN e.status = 'ACTIVE' THEN 1 ELSE 0 END), 0)
            FROM Employee e
            WHERE (:status IS NULL OR e.status = :status)
              AND (:selfId IS NULL OR e.id = :selfId)
              AND (:allStores = TRUE OR EXISTS (SELECT 1 FROM EmployeeStore vs
                    WHERE vs.employeeId = e.id AND vs.storeId IN :visibleStoreIds AND UPPER(vs.status) = 'ACTIVE'))
            """)
    List<Object[]> countInScope(@Param("status") String status,
                                @Param("selfId") Integer selfId,
                                @Param("allStores") boolean allStores,
                                @Param("visibleStoreIds") Collection<Integer> visibleStoreIds);

    /** Số nhân viên giữ vị trí trưởng cửa hàng (vai trò tài khoản STORE_MANAGER) trong phạm vi + bộ lọc trạng thái. */
    @Query("""
            SELECT COUNT(e) FROM Employee e
            WHERE (:status IS NULL OR e.status = :status)
              AND (:selfId IS NULL OR e.id = :selfId)
              AND (:allStores = TRUE OR EXISTS (SELECT 1 FROM EmployeeStore vs
                    WHERE vs.employeeId = e.id AND vs.storeId IN :visibleStoreIds AND UPPER(vs.status) = 'ACTIVE'))
              AND EXISTS (SELECT 1 FROM UserRole ur, Role r
                        WHERE ur.userId = e.user.id AND r.roleId = ur.roleId AND r.roleCode = 'STORE_MANAGER')
            """)
    long countStoreManagersInScope(@Param("status") String status,
                                   @Param("selfId") Integer selfId,
                                   @Param("allStores") boolean allStores,
                                   @Param("visibleStoreIds") Collection<Integer> visibleStoreIds);

    /** Mã nhân viên dạng NVxxxx (sinh mã tự động lấy số lớn nhất + 1). */
    @Query("SELECT e.employeeCode FROM Employee e WHERE e.employeeCode LIKE 'NV%'")
    List<String> findGeneratedCodes();
}
