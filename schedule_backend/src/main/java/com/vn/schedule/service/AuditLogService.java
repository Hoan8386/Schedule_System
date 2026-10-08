package com.vn.schedule.service;

import com.vn.schedule.domain.AuditLog;
import com.vn.schedule.repository.AuditLogRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.request.AuditLogRequest;
import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuditLogService {
    private final AuditLogRepository repository;
    public AuditLogService(AuditLogRepository repository) {
        this.repository = repository;
    }

    public List<AuditLog> findAll() {
        return repository.findAll();
    }

    public AuditLog findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public AuditLog create(AuditLogRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public AuditLog update(Integer id, AuditLogRequest body) {
        AuditLog current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public AuditLog save(AuditLogRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(AuditLogRequest body) {
        repository.delete(toEntity(body));
    }
    private AuditLog toEntity(AuditLogRequest body) {
        AuditLog entity = new AuditLog();
        entity.setAuditId((Integer) body.get("auditId"));
        entity.setUserId((Integer) body.get("userId"));
        entity.setAction((String) body.get("action"));
        entity.setEntityType((String) body.get("entityType"));
        entity.setEntityId((Integer) body.get("entityId"));
        entity.setOldValue((String) body.get("oldValue"));
        entity.setNewValue((String) body.get("newValue"));
        entity.setIpAddress((String) body.get("ipAddress"));
        entity.setUserAgent((String) body.get("userAgent"));
        return entity;
    }

    private void applyFields(AuditLog entity, AuditLogRequest body) {
        entity.setAuditId((Integer) body.get("auditId"));
        entity.setUserId((Integer) body.get("userId"));
        entity.setAction((String) body.get("action"));
        entity.setEntityType((String) body.get("entityType"));
        entity.setEntityId((Integer) body.get("entityId"));
        entity.setOldValue((String) body.get("oldValue"));
        entity.setNewValue((String) body.get("newValue"));
        entity.setIpAddress((String) body.get("ipAddress"));
        entity.setUserAgent((String) body.get("userAgent"));
    }
}
