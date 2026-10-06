package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.NotificationTemplate;

public interface NotificationTemplateRepository extends JpaRepository<NotificationTemplate, Integer> {
}

