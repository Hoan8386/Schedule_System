package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.AuditLog;
import com.vn.shopping.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

@Service
public class AuditLogService extends CrudService<AuditLog, Integer> {
    public AuditLogService(AuditLogRepository repository, ObjectMapper mapper) {
        super(repository, mapper, AuditLog.class);
    }
}
