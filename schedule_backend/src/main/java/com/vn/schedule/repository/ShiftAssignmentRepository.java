package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.ShiftAssignment;

import java.util.List;

public interface ShiftAssignmentRepository extends JpaRepository<ShiftAssignment, Integer> {
    List<ShiftAssignment> findByEmployeeIdOrderByRegisteredAtDesc(Integer employeeId);
    List<ShiftAssignment> findByShiftByDateId(Integer shiftByDateId);
}
