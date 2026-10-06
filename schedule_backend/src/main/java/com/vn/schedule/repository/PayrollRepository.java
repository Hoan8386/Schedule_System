package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.Payroll;

public interface PayrollRepository extends JpaRepository<Payroll, Integer> {
}

