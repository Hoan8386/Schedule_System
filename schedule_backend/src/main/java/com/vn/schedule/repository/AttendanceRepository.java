package com.vn.schedule.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.vn.schedule.domain.Attendance;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {
    List<Attendance> findByEmployeeIdOrderByCheckInAtDesc(Integer employeeId);

    /** Như findAll / findByEmployeeId... nhưng nạp kèm nhân viên và ca (tránh 2 truy vấn mỗi dòng khi dựng response). */
    @Query("""
            SELECT a FROM Attendance a
            JOIN FETCH a.employee
            LEFT JOIN FETCH a.shiftByDate
            ORDER BY a.id
            """)
    List<Attendance> findAllWithRefs();

    @Query("""
            SELECT a FROM Attendance a
            JOIN FETCH a.employee e
            LEFT JOIN FETCH a.shiftByDate
            WHERE e.id = :employeeId
            ORDER BY a.checkInAt DESC
            """)
    List<Attendance> findByEmployeeWithRefs(@Param("employeeId") Integer employeeId);

    /** Trang chấm công: phạm vi nhân viên + từ khóa (tên / mã NV / ghi chú) + trạng thái + khoảng ngày check-in. */
    @Query(value = """
            SELECT a FROM Attendance a
            JOIN FETCH a.employee e
            LEFT JOIN FETCH a.shiftByDate
            WHERE (:selfId IS NULL OR e.id = :selfId)
              AND (:allStores = TRUE OR EXISTS (SELECT 1 FROM EmployeeStore vs
                    WHERE vs.employeeId = e.id AND vs.storeId IN :visibleStoreIds AND UPPER(vs.status) = 'ACTIVE'))
              AND (:employeeId IS NULL OR e.id = :employeeId)
              AND (:status IS NULL OR a.attendanceStatus = :status)
              AND (:fromTime IS NULL OR a.checkInAt >= :fromTime)
              AND (:toTime IS NULL OR a.checkInAt < :toTime)
              AND (:keyword IS NULL OR e.fullName LIKE :keyword OR e.employeeCode LIKE :keyword
                   OR a.note LIKE :keyword OR CAST(e.id AS string) LIKE :keyword)
            """,
            countQuery = """
            SELECT COUNT(a) FROM Attendance a
            JOIN a.employee e
            WHERE (:selfId IS NULL OR e.id = :selfId)
              AND (:allStores = TRUE OR EXISTS (SELECT 1 FROM EmployeeStore vs
                    WHERE vs.employeeId = e.id AND vs.storeId IN :visibleStoreIds AND UPPER(vs.status) = 'ACTIVE'))
              AND (:employeeId IS NULL OR e.id = :employeeId)
              AND (:status IS NULL OR a.attendanceStatus = :status)
              AND (:fromTime IS NULL OR a.checkInAt >= :fromTime)
              AND (:toTime IS NULL OR a.checkInAt < :toTime)
              AND (:keyword IS NULL OR e.fullName LIKE :keyword OR e.employeeCode LIKE :keyword
                   OR a.note LIKE :keyword OR CAST(e.id AS string) LIKE :keyword)
            """)
    Page<Attendance> searchPage(@Param("selfId") Integer selfId,
                                @Param("allStores") boolean allStores,
                                @Param("visibleStoreIds") Collection<Integer> visibleStoreIds,
                                @Param("employeeId") Integer employeeId,
                                @Param("status") String status,
                                @Param("fromTime") LocalDateTime from,
                                @Param("toTime") LocalDateTime to,
                                @Param("keyword") String keyword,
                                Pageable pageable);

    /** Số liệu thẻ thống kê trong phạm vi: [tổng, chờ check-out, vắng, đi muộn hoặc bị từ chối]. */
    @Query("""
            SELECT COUNT(a),
                   COALESCE(SUM(CASE WHEN a.checkOutAt IS NULL THEN 1 ELSE 0 END), 0),
                   COALESCE(SUM(CASE WHEN a.attendanceStatus = 'ABSENT' THEN 1 ELSE 0 END), 0),
                   COALESCE(SUM(CASE WHEN a.attendanceStatus = 'LATE' OR a.approvalStatus = 'REJECTED' THEN 1 ELSE 0 END), 0)
            FROM Attendance a
            WHERE (:selfId IS NULL OR a.employee.id = :selfId)
              AND (:allStores = TRUE OR EXISTS (SELECT 1 FROM EmployeeStore vs
                    WHERE vs.employeeId = a.employee.id AND vs.storeId IN :visibleStoreIds AND UPPER(vs.status) = 'ACTIVE'))
            """)
    List<Object[]> summary(@Param("selfId") Integer selfId,
                           @Param("allStores") boolean allStores,
                           @Param("visibleStoreIds") Collection<Integer> visibleStoreIds);
}
