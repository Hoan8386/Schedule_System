package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.TestQuestion;

public interface TestQuestionRepository extends JpaRepository<TestQuestion, Integer> {
}

