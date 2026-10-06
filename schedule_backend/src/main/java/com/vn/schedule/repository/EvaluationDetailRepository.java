package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.EvaluationDetail;

public interface EvaluationDetailRepository extends JpaRepository<EvaluationDetail, Integer> {
}

