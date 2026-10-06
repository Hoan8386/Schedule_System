package com.vn.schedule.service;

import com.vn.schedule.domain.OrganizationSetting;
import com.vn.schedule.repository.OrganizationSettingRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.OrganizationSettingRequest;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OrganizationSettingService {
    private final OrganizationSettingRepository repository;
    public OrganizationSettingService(OrganizationSettingRepository repository) {
        this.repository = repository;
    }

    public List<OrganizationSetting> findAll() {
        return repository.findAll();
    }

    public OrganizationSetting findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public OrganizationSetting create(OrganizationSettingRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public OrganizationSetting update(Integer id, OrganizationSettingRequest body) {
        OrganizationSetting current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public OrganizationSetting save(OrganizationSettingRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(OrganizationSettingRequest body) {
        repository.delete(toEntity(body));
    }
    private OrganizationSetting toEntity(OrganizationSettingRequest body) {
        OrganizationSetting entity = new OrganizationSetting();
        entity.setOrganizationSettingId((Integer) body.get("organizationSettingId"));
        entity.setOrganizationName((String) body.get("organizationName"));
        entity.setLogoFileId((Integer) body.get("logoFileId"));
        entity.setFaviconFileId((Integer) body.get("faviconFileId"));
        entity.setPrimaryColor((String) body.get("primaryColor"));
        entity.setSecondaryColor((String) body.get("secondaryColor"));
        entity.setContactEmail((String) body.get("contactEmail"));
        entity.setContactPhone((String) body.get("contactPhone"));
        entity.setRegulations((String) body.get("regulations"));
        return entity;
    }

    private void applyFields(OrganizationSetting entity, OrganizationSettingRequest body) {
        entity.setOrganizationSettingId((Integer) body.get("organizationSettingId"));
        entity.setOrganizationName((String) body.get("organizationName"));
        entity.setLogoFileId((Integer) body.get("logoFileId"));
        entity.setFaviconFileId((Integer) body.get("faviconFileId"));
        entity.setPrimaryColor((String) body.get("primaryColor"));
        entity.setSecondaryColor((String) body.get("secondaryColor"));
        entity.setContactEmail((String) body.get("contactEmail"));
        entity.setContactPhone((String) body.get("contactPhone"));
        entity.setRegulations((String) body.get("regulations"));
    }
}
