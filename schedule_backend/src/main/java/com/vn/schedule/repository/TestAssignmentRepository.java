package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.TestAssignment;

public interface TestAssignmentRepository extends JpaRepository<TestAssignment, Integer> {
}

