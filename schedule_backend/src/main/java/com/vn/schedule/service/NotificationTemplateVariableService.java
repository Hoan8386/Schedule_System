package com.vn.schedule.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.schedule.domain.NotificationTemplateVariable;
import com.vn.schedule.domain.NotificationTemplateVariableId;
import com.vn.schedule.repository.NotificationTemplateVariableRepository;

import org.springframework.stereotype.Service;

@Service
public class NotificationTemplateVariableService extends CrudService<NotificationTemplateVariable, NotificationTemplateVariableId> {
    public NotificationTemplateVariableService(NotificationTemplateVariableRepository repository, ObjectMapper mapper) {
        super(repository, mapper, NotificationTemplateVariable.class);
    }
}


