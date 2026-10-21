package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.vn.schedule.domain.Feedback;

import java.util.Collection;

public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {
    /** Phản hồi chờ xử lý mà quản lý chuỗi / admin xử lý được (mọi phản hồi trừ của chính mình). */
    @Query("""
            SELECT COUNT(f) FROM Feedback f
            WHERE UPPER(f.status) = 'PENDING' AND (:me IS NULL OR f.employeeId <> :me)
            """)
    long countPendingExceptSender(@Param("me") Integer me);

    /** Phản hồi chờ xử lý gửi tới trưởng cửa hàng (chưa có đối tượng nhận = trưởng cửa hàng) tại các cửa hàng cho trước. */
    @Query("""
            SELECT COUNT(f) FROM Feedback f
            WHERE UPPER(f.status) = 'PENDING' AND (:me IS NULL OR f.employeeId <> :me)
              AND COALESCE(f.targetRole, 'STORE_MANAGER') = 'STORE_MANAGER'
              AND f.storeId IN :storeIds
            """)
    long countPendingForStoreManager(@Param("me") Integer me, @Param("storeIds") Collection<Integer> storeIds);
}
