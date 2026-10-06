package com.vn.shopping.repository;

import com.vn.shopping.domain.NotificationTemplateVariable;
import com.vn.shopping.domain.NotificationTemplateVariableId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationTemplateVariableRepository extends JpaRepository<NotificationTemplateVariable, NotificationTemplateVariableId> {
}

