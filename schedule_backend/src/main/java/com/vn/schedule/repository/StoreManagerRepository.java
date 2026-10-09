package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.StoreManager;

public interface StoreManagerRepository extends JpaRepository<StoreManager, Integer> {
    java.util.List<StoreManager> findByEmployeeIdAndStatus(Integer employeeId, String status);
}
