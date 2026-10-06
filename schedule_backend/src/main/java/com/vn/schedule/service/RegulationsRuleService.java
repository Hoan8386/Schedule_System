package com.vn.schedule.service;

import com.vn.schedule.domain.RegulationsRule;
import com.vn.schedule.repository.RegulationsRuleRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.RegulationsRuleRequest;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RegulationsRuleService {
    private final RegulationsRuleRepository repository;
    public RegulationsRuleService(RegulationsRuleRepository repository) {
        this.repository = repository;
    }

    public List<RegulationsRule> findAll() {
        return repository.findAll();
    }

    public RegulationsRule findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public RegulationsRule create(RegulationsRuleRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public RegulationsRule update(Integer id, RegulationsRuleRequest body) {
        RegulationsRule current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public RegulationsRule save(RegulationsRuleRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(RegulationsRuleRequest body) {
        repository.delete(toEntity(body));
    }
    private RegulationsRule toEntity(RegulationsRuleRequest body) {
        RegulationsRule entity = new RegulationsRule();
        entity.setRegulationsRuleId((Integer) body.get("regulationsRuleId"));
        entity.setOrganizationSettingId((Integer) body.get("organizationSettingId"));
        entity.setRuleId((Integer) body.get("ruleId"));
        return entity;
    }

    private void applyFields(RegulationsRule entity, RegulationsRuleRequest body) {
        entity.setRegulationsRuleId((Integer) body.get("regulationsRuleId"));
        entity.setOrganizationSettingId((Integer) body.get("organizationSettingId"));
        entity.setRuleId((Integer) body.get("ruleId"));
    }
}
