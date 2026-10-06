package com.vn.schedule.service;

import com.vn.schedule.domain.SystemConfig;
import com.vn.schedule.repository.SystemConfigRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.SystemConfigRequest;
import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SystemConfigService {
    private final SystemConfigRepository repository;
    public SystemConfigService(SystemConfigRepository repository) {
        this.repository = repository;
    }

    public List<SystemConfig> findAll() {
        return repository.findAll();
    }

    public SystemConfig findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public SystemConfig create(SystemConfigRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public SystemConfig update(Integer id, SystemConfigRequest body) {
        SystemConfig current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public SystemConfig save(SystemConfigRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(SystemConfigRequest body) {
        repository.delete(toEntity(body));
    }
    private SystemConfig toEntity(SystemConfigRequest body) {
        SystemConfig entity = new SystemConfig();
        entity.setConfigId((Integer) body.get("configId"));
        entity.setConfigKey((String) body.get("configKey"));
        entity.setConfigValue((String) body.get("configValue"));
        entity.setConfigType((String) body.get("configType"));
        entity.setDescription((String) body.get("description"));
        entity.setUpdatedBy((Integer) body.get("updatedBy"));
        return entity;
    }

    private void applyFields(SystemConfig entity, SystemConfigRequest body) {
        entity.setConfigId((Integer) body.get("configId"));
        entity.setConfigKey((String) body.get("configKey"));
        entity.setConfigValue((String) body.get("configValue"));
        entity.setConfigType((String) body.get("configType"));
        entity.setDescription((String) body.get("description"));
        entity.setUpdatedBy((Integer) body.get("updatedBy"));
    }
}
