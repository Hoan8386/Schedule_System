package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.Notification;
import com.vn.shopping.repository.NotificationRepository;
import org.springframework.stereotype.Service;

@Service
public class NotificationService extends CrudService<Notification, Integer> {
    public NotificationService(NotificationRepository repository, ObjectMapper mapper) {
        super(repository, mapper, Notification.class);
    }
}
