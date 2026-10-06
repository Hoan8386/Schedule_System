package com.vn.schedule.service;

import com.vn.schedule.domain.NotificationTemplateVariable;
import com.vn.schedule.domain.NotificationTemplateVariableId;
import com.vn.schedule.repository.NotificationTemplateVariableRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.NotificationTemplateVariableRequest;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationTemplateVariableService {
    private final NotificationTemplateVariableRepository repository;
    public NotificationTemplateVariableService(NotificationTemplateVariableRepository repository) {
        this.repository = repository;
    }

    public List<NotificationTemplateVariable> findAll() {
        return repository.findAll();
    }

    public NotificationTemplateVariable findById(NotificationTemplateVariableId id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Kh�f´ng t�f¬m tháº¥y báº£n ghi"));
    }

    @Transactional
    public NotificationTemplateVariable create(NotificationTemplateVariableRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public NotificationTemplateVariable update(NotificationTemplateVariableId id, NotificationTemplateVariableRequest body) {
        NotificationTemplateVariable current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(NotificationTemplateVariableId id) {
        repository.delete(findById(id));
    }

    @Transactional
    public NotificationTemplateVariable save(NotificationTemplateVariableRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(NotificationTemplateVariableRequest body) {
        repository.delete(toEntity(body));
    }
    private NotificationTemplateVariable toEntity(NotificationTemplateVariableRequest body) {
        NotificationTemplateVariable entity = new NotificationTemplateVariable();
        entity.setNotificationTemplateId((Integer) body.get("notificationTemplateId"));
        entity.setVariableId((Integer) body.get("variableId"));
        return entity;
    }

    private void applyFields(NotificationTemplateVariable entity, NotificationTemplateVariableRequest body) {
        entity.setNotificationTemplateId((Integer) body.get("notificationTemplateId"));
        entity.setVariableId((Integer) body.get("variableId"));
    }
}
