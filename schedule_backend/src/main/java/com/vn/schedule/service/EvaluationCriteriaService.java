package com.vn.schedule.service;

import com.vn.schedule.domain.EvaluationCriteria;
import com.vn.schedule.repository.EvaluationCriteriaRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.EvaluationCriteriaRequest;
import java.time.LocalDateTime;
import java.math.BigDecimal;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EvaluationCriteriaService {
    private final EvaluationCriteriaRepository repository;
    public EvaluationCriteriaService(EvaluationCriteriaRepository repository) {
        this.repository = repository;
    }

    public List<EvaluationCriteria> findAll() {
        return repository.findAll();
    }

    public EvaluationCriteria findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public EvaluationCriteria create(EvaluationCriteriaRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public EvaluationCriteria update(Integer id, EvaluationCriteriaRequest body) {
        EvaluationCriteria current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public EvaluationCriteria save(EvaluationCriteriaRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(EvaluationCriteriaRequest body) {
        repository.delete(toEntity(body));
    }
    private EvaluationCriteria toEntity(EvaluationCriteriaRequest body) {
        EvaluationCriteria entity = new EvaluationCriteria();
        entity.setCriteriaId((Integer) body.get("criteriaId"));
        entity.setCriteriaCode((String) body.get("criteriaCode"));
        entity.setCriteriaName((String) body.get("criteriaName"));
        entity.setCriteriaType((String) body.get("criteriaType"));
        entity.setDescription((String) body.get("description"));
        entity.setTargetValue((BigDecimal) body.get("targetValue"));
        entity.setPeriodType((String) body.get("periodType"));
        entity.setMaxScore((BigDecimal) body.get("maxScore"));
        entity.setWeight((BigDecimal) body.get("weight"));
        entity.setStatus((String) body.get("status"));
        entity.setCreatedBy((Integer) body.get("createdBy"));
        return entity;
    }

    private void applyFields(EvaluationCriteria entity, EvaluationCriteriaRequest body) {
        entity.setCriteriaId((Integer) body.get("criteriaId"));
        entity.setCriteriaCode((String) body.get("criteriaCode"));
        entity.setCriteriaName((String) body.get("criteriaName"));
        entity.setCriteriaType((String) body.get("criteriaType"));
        entity.setDescription((String) body.get("description"));
        entity.setTargetValue((BigDecimal) body.get("targetValue"));
        entity.setPeriodType((String) body.get("periodType"));
        entity.setMaxScore((BigDecimal) body.get("maxScore"));
        entity.setWeight((BigDecimal) body.get("weight"));
        entity.setStatus((String) body.get("status"));
        entity.setCreatedBy((Integer) body.get("createdBy"));
    }
}
