package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.Violation;

public interface ViolationRepository extends JpaRepository<Violation, Integer> {
}

