package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.EvaluationCriteria;

public interface EvaluationCriteriaRepository extends JpaRepository<EvaluationCriteria, Integer> {
}

