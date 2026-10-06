package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.EmployeeWorkSummary;

public interface EmployeeWorkSummaryRepository extends JpaRepository<EmployeeWorkSummary, Integer> {
}

