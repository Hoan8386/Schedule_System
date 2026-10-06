package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.Feedback;

public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {
}

