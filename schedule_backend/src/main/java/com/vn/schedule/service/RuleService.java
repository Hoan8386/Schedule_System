package com.vn.schedule.service;

import com.vn.schedule.domain.Rule;
import com.vn.schedule.repository.RuleRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.request.RuleRequest;
import java.time.LocalDateTime;
import java.math.BigDecimal;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RuleService {
    private final RuleRepository repository;
    public RuleService(RuleRepository repository) {
        this.repository = repository;
    }

    public List<Rule> findAll() {
        return repository.findAll();
    }

    public Rule findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public Rule create(RuleRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public Rule update(Integer id, RuleRequest body) {
        Rule current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public Rule save(RuleRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(RuleRequest body) {
        repository.delete(toEntity(body));
    }
    private Rule toEntity(RuleRequest body) {
        Rule entity = new Rule();
        entity.setRuleId((Integer) body.get("ruleId"));
        entity.setRuleCode((String) body.get("ruleCode"));
        entity.setRuleName((String) body.get("ruleName"));
        entity.setCategory((String) body.get("category"));
        entity.setDescription((String) body.get("description"));
        entity.setPenaltyType((String) body.get("penaltyType"));
        entity.setPenaltyAmount((BigDecimal) body.get("penaltyAmount"));
        entity.setStatus((String) body.get("status"));
        entity.setCreatedBy((Integer) body.get("createdBy"));
        entity.setUpdatedBy((Integer) body.get("updatedBy"));
        return entity;
    }

    private void applyFields(Rule entity, RuleRequest body) {
        entity.setRuleId((Integer) body.get("ruleId"));
        entity.setRuleCode((String) body.get("ruleCode"));
        entity.setRuleName((String) body.get("ruleName"));
        entity.setCategory((String) body.get("category"));
        entity.setDescription((String) body.get("description"));
        entity.setPenaltyType((String) body.get("penaltyType"));
        entity.setPenaltyAmount((BigDecimal) body.get("penaltyAmount"));
        entity.setStatus((String) body.get("status"));
        entity.setCreatedBy((Integer) body.get("createdBy"));
        entity.setUpdatedBy((Integer) body.get("updatedBy"));
    }
}
