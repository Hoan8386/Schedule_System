package com.vn.schedule.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.schedule.domain.Notification;
import com.vn.schedule.repository.NotificationRepository;

import org.springframework.stereotype.Service;

@Service
public class NotificationService extends CrudService<Notification, Integer> {
    public NotificationService(NotificationRepository repository, ObjectMapper mapper) {
        super(repository, mapper, Notification.class);
    }
}
