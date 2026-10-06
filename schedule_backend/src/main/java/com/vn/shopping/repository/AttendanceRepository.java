package com.vn.shopping.repository;

import com.vn.shopping.domain.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {
    List<Attendance> findByEmployeeIdOrderByCheckInAtDesc(Integer employeeId);
}

