package com.vn.schedule.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.schedule.domain.SystemConfig;
import com.vn.schedule.repository.SystemConfigRepository;

import org.springframework.stereotype.Service;

@Service
public class SystemConfigService extends CrudService<SystemConfig, Integer> {
    public SystemConfigService(SystemConfigRepository repository, ObjectMapper mapper) {
        super(repository, mapper, SystemConfig.class);
    }
}
