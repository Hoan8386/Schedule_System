package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.ShiftByDate;

import java.time.LocalDate;
import java.util.List;

public interface ShiftByDateRepository extends JpaRepository<ShiftByDate, Integer> {
    List<ShiftByDate> findByWorkDateBetweenOrderByWorkDateAscStartTimeAsc(LocalDate from, LocalDate to);

    java.util.Optional<ShiftByDate> findByShift_IdAndWorkDate(Integer shiftId, LocalDate workDate);

    /**
     * Ca theo ngày kèm ca mẫu / kỳ / đợt / phiên (JOIN FETCH quan hệ ManyToOne, không có collection nên an toàn).
     * Phạm vi: allStores, hoặc ca thuộc cửa hàng storeIds, hoặc (assignedEmployeeId) ca nhân viên từng được phân.
     */
    @org.springframework.data.jpa.repository.Query("""
            SELECT sbd FROM ShiftByDate sbd
            JOIN FETCH sbd.shift s
            LEFT JOIN FETCH sbd.schedulePeriod
            LEFT JOIN FETCH sbd.scheduleRound
            LEFT JOIN FETCH sbd.scheduleSession
            WHERE (:allStores = TRUE OR s.store.id IN :storeIds)
              AND (:assignedEmployeeId IS NULL OR EXISTS (SELECT 1 FROM ShiftAssignment sa
                    WHERE sa.shiftByDate = sbd AND sa.employee.id = :assignedEmployeeId))
              AND (:fromDate IS NULL OR sbd.workDate >= :fromDate)
              AND (:toDate IS NULL OR sbd.workDate <= :toDate)
              AND (:storeId IS NULL OR s.store.id = :storeId)
              AND (:status IS NULL OR UPPER(sbd.status) = UPPER(:status))
              AND (:keyword IS NULL OR LOWER(sbd.shiftName) LIKE :keyword
                   OR LOWER(s.shiftName) LIKE :keyword OR LOWER(s.shiftCode) LIKE :keyword)
            ORDER BY sbd.id
            """)
    List<ShiftByDate> search(
            @org.springframework.data.repository.query.Param("allStores") boolean allStores,
            @org.springframework.data.repository.query.Param("storeIds") java.util.Collection<Integer> storeIds,
            @org.springframework.data.repository.query.Param("assignedEmployeeId") Integer assignedEmployeeId,
            @org.springframework.data.repository.query.Param("fromDate") LocalDate from,
            @org.springframework.data.repository.query.Param("toDate") LocalDate to,
            @org.springframework.data.repository.query.Param("storeId") Integer storeId,
            @org.springframework.data.repository.query.Param("status") String status,
            @org.springframework.data.repository.query.Param("keyword") String keyword);
}

