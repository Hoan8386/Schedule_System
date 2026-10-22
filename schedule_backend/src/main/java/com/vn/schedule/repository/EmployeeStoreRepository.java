package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.vn.schedule.domain.EmployeeStore;

import java.util.Collection;
import java.util.List;
import java.util.Set;

public interface EmployeeStoreRepository extends JpaRepository<EmployeeStore, Integer> {
    List<EmployeeStore> findByEmployeeIdAndStatus(Integer employeeId, String status);

    @Query("""
            SELECT DISTINCT es.employeeId FROM EmployeeStore es
            WHERE es.storeId IN :storeIds AND UPPER(es.status) = 'ACTIVE'
            """)
    Set<Integer> findActiveEmployeeIdsByStoreIds(@Param("storeIds") Collection<Integer> storeIds);

    /**
     * Phân bổ cửa hàng theo bộ lọc (null = bỏ qua điều kiện). Vai trò MANAGER / EMPLOYEE so với store_manager
     * cùng nhân viên + cửa hàng (bộ lọc trạng thái áp dụng cho cả store_manager như trước đây).
     */
    @Query("""
            SELECT es FROM EmployeeStore es
            WHERE (:allStores = TRUE OR es.storeId IN :visibleStoreIds)
              AND (:allEmployees = TRUE OR es.employeeId IN :employeeIds)
              AND (:storeId IS NULL OR es.storeId = :storeId)
              AND (:status IS NULL OR UPPER(es.status) = UPPER(:status))
              AND (:primary IS NULL OR es.isPrimary = :primary)
              AND (:role IS NULL
                   OR (:role = 'MANAGER' AND EXISTS (SELECT 1 FROM StoreManager sm
                        WHERE sm.employeeId = es.employeeId AND sm.storeId = es.storeId
                          AND (:status IS NULL OR UPPER(sm.status) = UPPER(:status))))
                   OR (:role = 'EMPLOYEE' AND NOT EXISTS (SELECT 1 FROM StoreManager sm
                        WHERE sm.employeeId = es.employeeId AND sm.storeId = es.storeId
                          AND (:status IS NULL OR UPPER(sm.status) = UPPER(:status)))))
            ORDER BY es.employeeStoreId
            """)
    List<EmployeeStore> search(@Param("allStores") boolean allStores,
                               @Param("visibleStoreIds") Collection<Integer> visibleStoreIds,
                               @Param("allEmployees") boolean allEmployees,
                               @Param("employeeIds") Collection<Integer> employeeIds,
                               @Param("storeId") Integer storeId,
                               @Param("status") String status,
                               @Param("primary") Boolean primary,
                               @Param("role") String role);
}
