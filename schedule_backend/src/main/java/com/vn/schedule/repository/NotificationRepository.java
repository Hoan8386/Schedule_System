package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {
}

