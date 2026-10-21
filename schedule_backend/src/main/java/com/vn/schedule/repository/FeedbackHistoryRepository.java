package com.vn.schedule.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.FeedbackHistory;

public interface FeedbackHistoryRepository extends JpaRepository<FeedbackHistory, Integer> {
    List<FeedbackHistory> findByFeedbackIdOrderByCreatedAtAscHistoryIdAsc(Integer feedbackId);
}
