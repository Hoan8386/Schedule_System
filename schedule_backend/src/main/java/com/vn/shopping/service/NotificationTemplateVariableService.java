package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.NotificationTemplateVariable;
import com.vn.shopping.domain.NotificationTemplateVariableId;
import com.vn.shopping.repository.NotificationTemplateVariableRepository;
import org.springframework.stereotype.Service;

@Service
public class NotificationTemplateVariableService extends CrudService<NotificationTemplateVariable, NotificationTemplateVariableId> {
    public NotificationTemplateVariableService(NotificationTemplateVariableRepository repository, ObjectMapper mapper) {
        super(repository, mapper, NotificationTemplateVariable.class);
    }
}


