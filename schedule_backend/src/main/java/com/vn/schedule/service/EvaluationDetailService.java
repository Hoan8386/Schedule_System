package com.vn.schedule.service;

import com.vn.schedule.domain.EvaluationDetail;
import com.vn.schedule.repository.EvaluationDetailRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.EvaluationDetailRequest;
import java.math.BigDecimal;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EvaluationDetailService {
    private final EvaluationDetailRepository repository;
    public EvaluationDetailService(EvaluationDetailRepository repository) {
        this.repository = repository;
    }

    public List<EvaluationDetail> findAll() {
        return repository.findAll();
    }

    public EvaluationDetail findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public EvaluationDetail create(EvaluationDetailRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public EvaluationDetail update(Integer id, EvaluationDetailRequest body) {
        EvaluationDetail current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public EvaluationDetail save(EvaluationDetailRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(EvaluationDetailRequest body) {
        repository.delete(toEntity(body));
    }
    private EvaluationDetail toEntity(EvaluationDetailRequest body) {
        EvaluationDetail entity = new EvaluationDetail();
        entity.setEvaluationDetailId((Integer) body.get("evaluationDetailId"));
        entity.setEvaluationId((Integer) body.get("evaluationId"));
        entity.setCriteriaId((Integer) body.get("criteriaId"));
        entity.setScore((BigDecimal) body.get("score"));
        entity.setActualValue((BigDecimal) body.get("actualValue"));
        entity.setTargetValue((BigDecimal) body.get("targetValue"));
        entity.setExceededValue((BigDecimal) body.get("exceededValue"));
        entity.setComment((String) body.get("comment"));
        return entity;
    }

    private void applyFields(EvaluationDetail entity, EvaluationDetailRequest body) {
        entity.setEvaluationDetailId((Integer) body.get("evaluationDetailId"));
        entity.setEvaluationId((Integer) body.get("evaluationId"));
        entity.setCriteriaId((Integer) body.get("criteriaId"));
        entity.setScore((BigDecimal) body.get("score"));
        entity.setActualValue((BigDecimal) body.get("actualValue"));
        entity.setTargetValue((BigDecimal) body.get("targetValue"));
        entity.setExceededValue((BigDecimal) body.get("exceededValue"));
        entity.setComment((String) body.get("comment"));
    }
}
