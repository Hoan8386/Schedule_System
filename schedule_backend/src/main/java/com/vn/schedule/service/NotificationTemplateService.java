package com.vn.schedule.service;

import com.vn.schedule.domain.NotificationTemplate;
import com.vn.schedule.repository.NotificationTemplateRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.request.NotificationTemplateRequest;
import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationTemplateService {
    private final NotificationTemplateRepository repository;
    public NotificationTemplateService(NotificationTemplateRepository repository) {
        this.repository = repository;
    }

    public List<NotificationTemplate> findAll() {
        return repository.findAll();
    }

    public NotificationTemplate findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public NotificationTemplate create(NotificationTemplateRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public NotificationTemplate update(Integer id, NotificationTemplateRequest body) {
        NotificationTemplate current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public NotificationTemplate save(NotificationTemplateRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(NotificationTemplateRequest body) {
        repository.delete(toEntity(body));
    }
    private NotificationTemplate toEntity(NotificationTemplateRequest body) {
        NotificationTemplate entity = new NotificationTemplate();
        entity.setNotificationTemplateId((Integer) body.get("notificationTemplateId"));
        entity.setTemplateCode((String) body.get("templateCode"));
        entity.setTitle((String) body.get("title"));
        entity.setContent((String) body.get("content"));
        entity.setStatus((String) body.get("status"));
        entity.setUpdatedBy((Integer) body.get("updatedBy"));
        return entity;
    }

    private void applyFields(NotificationTemplate entity, NotificationTemplateRequest body) {
        entity.setNotificationTemplateId((Integer) body.get("notificationTemplateId"));
        entity.setTemplateCode((String) body.get("templateCode"));
        entity.setTitle((String) body.get("title"));
        entity.setContent((String) body.get("content"));
        entity.setStatus((String) body.get("status"));
        entity.setUpdatedBy((Integer) body.get("updatedBy"));
    }
}
