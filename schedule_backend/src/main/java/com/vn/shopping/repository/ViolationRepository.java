package com.vn.shopping.repository;

import com.vn.shopping.domain.Violation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ViolationRepository extends JpaRepository<Violation, Integer> {
}

