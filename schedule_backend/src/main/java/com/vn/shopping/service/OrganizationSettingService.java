package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.OrganizationSetting;
import com.vn.shopping.repository.OrganizationSettingRepository;
import org.springframework.stereotype.Service;

@Service
public class OrganizationSettingService extends CrudService<OrganizationSetting, Integer> {
    public OrganizationSettingService(OrganizationSettingRepository repository, ObjectMapper mapper) {
        super(repository, mapper, OrganizationSetting.class);
    }
}
