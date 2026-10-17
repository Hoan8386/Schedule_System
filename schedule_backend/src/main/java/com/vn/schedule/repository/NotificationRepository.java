package com.vn.schedule.repository;

import java.time.LocalDateTime;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.vn.schedule.domain.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    /** Thông báo của một nhân viên theo trạng thái đọc (is_read NULL được coi là chưa đọc), mới nhất trước. */
    @Query("""
            SELECT n FROM Notification n
            WHERE n.employeeId = :employeeId
              AND COALESCE(n.isRead, false) = :read
            ORDER BY n.createdAt DESC, n.notificationId DESC
            """)
    Slice<Notification> findByEmployeeAndReadState(@Param("employeeId") Integer employeeId,
                                                   @Param("read") boolean read,
                                                   Pageable pageable);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.employeeId = :employeeId AND COALESCE(n.isRead, false) = false")
    long countUnread(@Param("employeeId") Integer employeeId);

    @Modifying
    @Query("""
            UPDATE Notification n SET n.isRead = true, n.readAt = :readAt
            WHERE n.employeeId = :employeeId AND COALESCE(n.isRead, false) = false
            """)
    int markAllRead(@Param("employeeId") Integer employeeId, @Param("readAt") LocalDateTime readAt);
}
