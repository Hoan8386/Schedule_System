package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.EventScope;

public interface EventScopeRepository extends JpaRepository<EventScope, Integer> {
}

