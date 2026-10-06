package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.NotificationTemplate;
import com.vn.shopping.repository.NotificationTemplateRepository;
import org.springframework.stereotype.Service;

@Service
public class NotificationTemplateService extends CrudService<NotificationTemplate, Integer> {
    public NotificationTemplateService(NotificationTemplateRepository repository, ObjectMapper mapper) {
        super(repository, mapper, NotificationTemplate.class);
    }
}
