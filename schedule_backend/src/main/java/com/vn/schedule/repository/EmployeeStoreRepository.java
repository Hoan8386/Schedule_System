package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.EmployeeStore;

import java.util.List;

public interface EmployeeStoreRepository extends JpaRepository<EmployeeStore, Integer> {
    List<EmployeeStore> findByEmployeeIdAndStatus(Integer employeeId, String status);
}

