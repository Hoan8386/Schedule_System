package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.Shift;

import java.util.List;

public interface ShiftRepository extends JpaRepository<Shift, Integer> {
    List<Shift> findByStoreIdAndStatusOrderByStartTime(Integer storeId, String status);

    /** Ca mẫu kèm cửa hàng / nhóm ca (response cần tên) – lọc phạm vi, cửa hàng, trạng thái tại DB. */
    @org.springframework.data.jpa.repository.Query("""
            SELECT s FROM Shift s
            JOIN FETCH s.store st
            LEFT JOIN FETCH s.shiftGroup
            WHERE (:allStores = TRUE OR st.id IN :storeIds)
              AND (:storeId IS NULL OR st.id = :storeId)
              AND (:status IS NULL OR UPPER(s.status) = UPPER(:status))
            ORDER BY s.id
            """)
    List<Shift> search(@org.springframework.data.repository.query.Param("allStores") boolean allStores,
                       @org.springframework.data.repository.query.Param("storeIds") java.util.Collection<Integer> storeIds,
                       @org.springframework.data.repository.query.Param("storeId") Integer storeId,
                       @org.springframework.data.repository.query.Param("status") String status);
}

