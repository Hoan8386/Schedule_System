package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.EmployeeEvaluation;

public interface EmployeeEvaluationRepository extends JpaRepository<EmployeeEvaluation, Integer> {
}

