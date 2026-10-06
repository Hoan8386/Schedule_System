package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.SpecialEvent;

public interface SpecialEventRepository extends JpaRepository<SpecialEvent, Integer> {
}

