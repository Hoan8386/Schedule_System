package com.vn.schedule.service;

import com.vn.schedule.domain.Notification;
import com.vn.schedule.repository.NotificationRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.NotificationRequest;
import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {
    private final NotificationRepository repository;
    public NotificationService(NotificationRepository repository) {
        this.repository = repository;
    }

    public List<Notification> findAll() {
        return repository.findAll();
    }

    public Notification findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public Notification create(NotificationRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public Notification update(Integer id, NotificationRequest body) {
        Notification current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public Notification save(NotificationRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(NotificationRequest body) {
        repository.delete(toEntity(body));
    }
    private Notification toEntity(NotificationRequest body) {
        Notification entity = new Notification();
        entity.setNotificationId((Integer) body.get("notificationId"));
        entity.setEmployeeId((Integer) body.get("employeeId"));
        entity.setNotificationTemplateId((Integer) body.get("notificationTemplateId"));
        entity.setTitle((String) body.get("title"));
        entity.setContent((String) body.get("content"));
        entity.setNotificationType((String) body.get("notificationType"));
        entity.setSourceType((String) body.get("sourceType"));
        entity.setSourceId((Integer) body.get("sourceId"));
        entity.setIsRead((Boolean) body.get("isRead"));
        entity.setReadAt((LocalDateTime) body.get("readAt"));
        return entity;
    }

    private void applyFields(Notification entity, NotificationRequest body) {
        entity.setNotificationId((Integer) body.get("notificationId"));
        entity.setEmployeeId((Integer) body.get("employeeId"));
        entity.setNotificationTemplateId((Integer) body.get("notificationTemplateId"));
        entity.setTitle((String) body.get("title"));
        entity.setContent((String) body.get("content"));
        entity.setNotificationType((String) body.get("notificationType"));
        entity.setSourceType((String) body.get("sourceType"));
        entity.setSourceId((Integer) body.get("sourceId"));
        entity.setIsRead((Boolean) body.get("isRead"));
        entity.setReadAt((LocalDateTime) body.get("readAt"));
    }
}
