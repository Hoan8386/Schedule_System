package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.ShiftAssignment;

import java.util.List;

public interface ShiftAssignmentRepository extends JpaRepository<ShiftAssignment, Integer> {
    List<ShiftAssignment> findByEmployeeIdOrderByRegisteredAtDesc(Integer employeeId);
    List<ShiftAssignment> findByShiftByDateId(Integer shiftByDateId);

    /**
     * Phân ca trong phạm vi được xem, lọc tại DB (null = bỏ qua điều kiện).
     * Chỉ join để lọc, không nạp ca / nhân viên vì response chỉ cần khóa ngoại.
     */
    @org.springframework.data.jpa.repository.Query("""
            SELECT sa FROM ShiftAssignment sa
            JOIN sa.shiftByDate sbd
            JOIN sbd.shift s
            WHERE (:allStores = TRUE OR s.store.id IN :storeIds)
              AND (:employeeId IS NULL OR sa.employee.id = :employeeId)
              AND (:storeId IS NULL OR s.store.id = :storeId)
              AND (:fromDate IS NULL OR sbd.workDate >= :fromDate)
              AND (:toDate IS NULL OR sbd.workDate <= :toDate)
              AND (:status IS NULL OR UPPER(sa.status) = UPPER(:status))
            ORDER BY sa.id
            """)
    List<ShiftAssignment> search(
            @org.springframework.data.repository.query.Param("allStores") boolean allStores,
            @org.springframework.data.repository.query.Param("storeIds") java.util.Collection<Integer> storeIds,
            @org.springframework.data.repository.query.Param("employeeId") Integer employeeId,
            @org.springframework.data.repository.query.Param("storeId") Integer storeId,
            @org.springframework.data.repository.query.Param("fromDate") java.time.LocalDate from,
            @org.springframework.data.repository.query.Param("toDate") java.time.LocalDate to,
            @org.springframework.data.repository.query.Param("status") String status);

    @org.springframework.data.jpa.repository.Query("""
            SELECT COUNT(sa) > 0 FROM ShiftAssignment sa
            WHERE sa.shiftByDate.id = :shiftByDateId AND sa.employee.id = :employeeId
              AND UPPER(sa.status) NOT IN ('CANCELLED', 'REJECTED')
            """)
    boolean existsActive(@org.springframework.data.repository.query.Param("shiftByDateId") Integer shiftByDateId,
                         @org.springframework.data.repository.query.Param("employeeId") Integer employeeId);
}
