package com.vn.shopping.repository;

import com.vn.shopping.domain.EmergencyRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmergencyRequestRepository extends JpaRepository<EmergencyRequest, Integer> {
}

