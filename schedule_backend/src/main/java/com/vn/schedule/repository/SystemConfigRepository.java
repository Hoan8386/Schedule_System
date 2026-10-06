package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.SystemConfig;

public interface SystemConfigRepository extends JpaRepository<SystemConfig, Integer> {
}

