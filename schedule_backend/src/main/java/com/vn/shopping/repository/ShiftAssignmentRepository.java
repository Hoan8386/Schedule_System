package com.vn.shopping.repository;

import com.vn.shopping.domain.ShiftAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ShiftAssignmentRepository extends JpaRepository<ShiftAssignment, Integer> {
    List<ShiftAssignment> findByEmployeeIdOrderByRegisteredAtDesc(Integer employeeId);
    List<ShiftAssignment> findByShiftByDateId(Integer shiftByDateId);
}

