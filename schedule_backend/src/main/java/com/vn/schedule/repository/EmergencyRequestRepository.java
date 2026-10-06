package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.EmergencyRequest;

public interface EmergencyRequestRepository extends JpaRepository<EmergencyRequest, Integer> {
}

