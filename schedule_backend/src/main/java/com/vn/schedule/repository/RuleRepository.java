package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.Rule;

public interface RuleRepository extends JpaRepository<Rule, Integer> {
}

