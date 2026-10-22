package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.vn.schedule.domain.EmergencyRequest;

import java.util.List;

public interface EmergencyRequestRepository extends JpaRepository<EmergencyRequest, Integer> {
    List<EmergencyRequest> findByEmployeeIdOrderByRequestedAtDescEmergencyRequestIdDesc(Integer employeeId);

    /** Phân ca đang nằm trong một yêu cầu PENDING (là ca nguồn hoặc ca của đồng nghiệp đổi cùng). */
    @Query("""
            SELECT COUNT(er) > 0 FROM EmergencyRequest er
            WHERE er.status = 'PENDING'
              AND (er.assignmentId = :assignmentId OR er.swapAssignmentId = :assignmentId)
            """)
    boolean existsPendingForAssignment(@Param("assignmentId") Integer assignmentId);

    @Query("""
            SELECT COUNT(er) > 0 FROM EmergencyRequest er
            WHERE er.status = 'PENDING' AND er.employeeId = :employeeId AND er.toAssignmentId = :shiftByDateId
            """)
    boolean existsPendingAdd(@Param("employeeId") Integer employeeId, @Param("shiftByDateId") Integer shiftByDateId);
}
