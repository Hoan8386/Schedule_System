package com.vn.schedule.service;

import com.vn.schedule.domain.Violation;
import com.vn.schedule.repository.ViolationRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.ViolationRequest;
import java.time.LocalDateTime;
import java.math.BigDecimal;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ViolationService {
    private final ViolationRepository repository;
    public ViolationService(ViolationRepository repository) {
        this.repository = repository;
    }

    public List<Violation> findAll() {
        return repository.findAll();
    }

    public Violation findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public Violation create(ViolationRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public Violation update(Integer id, ViolationRequest body) {
        Violation current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public Violation save(ViolationRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(ViolationRequest body) {
        repository.delete(toEntity(body));
    }
    private Violation toEntity(ViolationRequest body) {
        Violation entity = new Violation();
        entity.setViolationId((Integer) body.get("violationId"));
        entity.setRuleId((Integer) body.get("ruleId"));
        entity.setDisciplinaryCodeId((Integer) body.get("disciplinaryCodeId"));
        entity.setAttendanceId((Integer) body.get("attendanceId"));
        entity.setViolationTime((LocalDateTime) body.get("violationTime"));
        entity.setDescription((String) body.get("description"));
        entity.setEvidenceId((Integer) body.get("evidenceId"));
        entity.setRuleName((String) body.get("ruleName"));
        entity.setCategory((String) body.get("category"));
        entity.setRuleDescription((String) body.get("ruleDescription"));
        entity.setPenaltyType((String) body.get("penaltyType"));
        entity.setPenaltyAmount((BigDecimal) body.get("penaltyAmount"));
        entity.setStatus((String) body.get("status"));
        entity.setCreatedBy((Integer) body.get("createdBy"));
        return entity;
    }

    private void applyFields(Violation entity, ViolationRequest body) {
        entity.setViolationId((Integer) body.get("violationId"));
        entity.setRuleId((Integer) body.get("ruleId"));
        entity.setDisciplinaryCodeId((Integer) body.get("disciplinaryCodeId"));
        entity.setAttendanceId((Integer) body.get("attendanceId"));
        entity.setViolationTime((LocalDateTime) body.get("violationTime"));
        entity.setDescription((String) body.get("description"));
        entity.setEvidenceId((Integer) body.get("evidenceId"));
        entity.setRuleName((String) body.get("ruleName"));
        entity.setCategory((String) body.get("category"));
        entity.setRuleDescription((String) body.get("ruleDescription"));
        entity.setPenaltyType((String) body.get("penaltyType"));
        entity.setPenaltyAmount((BigDecimal) body.get("penaltyAmount"));
        entity.setStatus((String) body.get("status"));
        entity.setCreatedBy((Integer) body.get("createdBy"));
    }
}
