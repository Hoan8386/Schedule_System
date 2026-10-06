package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.NotificationTemplateVariable;
import com.vn.schedule.domain.NotificationTemplateVariableId;

public interface NotificationTemplateVariableRepository extends JpaRepository<NotificationTemplateVariable, NotificationTemplateVariableId> {
}

