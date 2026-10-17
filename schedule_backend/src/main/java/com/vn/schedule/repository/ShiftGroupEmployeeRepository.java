package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import com.vn.schedule.domain.ShiftGroupEmployee;

import java.util.List;

public interface ShiftGroupEmployeeRepository extends JpaRepository<ShiftGroupEmployee, Integer> {
    List<ShiftGroupEmployee> findByShiftGroupId(Integer shiftGroupId);

    boolean existsByShiftGroupIdAndEmployeeId(Integer shiftGroupId, Integer employeeId);

    @Modifying
    @Query("DELETE FROM ShiftGroupEmployee m WHERE m.shiftGroupId = :shiftGroupId")
    void deleteByShiftGroupId(Integer shiftGroupId);
}
