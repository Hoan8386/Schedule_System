package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.EmployeeStore;

public interface EmployeeStoreRepository extends JpaRepository<EmployeeStore, Integer> {
}

