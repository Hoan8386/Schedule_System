package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.Test;

public interface TestRepository extends JpaRepository<Test, Integer> {
}

