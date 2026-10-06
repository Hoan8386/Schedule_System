package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.PayrollDetail;

public interface PayrollDetailRepository extends JpaRepository<PayrollDetail, Integer> {
}

