package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import com.vn.schedule.domain.ShiftGroupEmployee;

import java.util.List;

public interface ShiftGroupEmployeeRepository extends JpaRepository<ShiftGroupEmployee, Integer> {
    List<ShiftGroupEmployee> findByShiftGroupId(Integer shiftGroupId);

    @Modifying
    @Query("DELETE FROM ShiftGroupEmployee m WHERE m.shiftGroupId = :shiftGroupId")
    void deleteByShiftGroupId(Integer shiftGroupId);

    /** [shiftGroupId, số thành viên] cho mọi nhóm ca có thành viên. */
    @Query("SELECT m.shiftGroupId, COUNT(m) FROM ShiftGroupEmployee m GROUP BY m.shiftGroupId")
    List<Object[]> countByGroup();
}
