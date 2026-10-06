package com.vn.schedule.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.schedule.domain.AuditLog;
import com.vn.schedule.repository.AuditLogRepository;

import org.springframework.stereotype.Service;

@Service
public class AuditLogService extends CrudService<AuditLog, Integer> {
    public AuditLogService(AuditLogRepository repository, ObjectMapper mapper) {
        super(repository, mapper, AuditLog.class);
    }
}
