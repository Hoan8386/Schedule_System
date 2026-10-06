package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.TestResult;

public interface TestResultRepository extends JpaRepository<TestResult, Integer> {
}

