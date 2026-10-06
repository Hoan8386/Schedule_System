package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.SystemConfig;
import com.vn.shopping.repository.SystemConfigRepository;
import org.springframework.stereotype.Service;

@Service
public class SystemConfigService extends CrudService<SystemConfig, Integer> {
    public SystemConfigService(SystemConfigRepository repository, ObjectMapper mapper) {
        super(repository, mapper, SystemConfig.class);
    }
}
