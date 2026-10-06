package com.vn.schedule.service;

import com.vn.schedule.domain.EmployeeEvaluation;
import com.vn.schedule.repository.EmployeeEvaluationRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.EmployeeEvaluationRequest;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.math.BigDecimal;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EmployeeEvaluationService {
    private final EmployeeEvaluationRepository repository;
    public EmployeeEvaluationService(EmployeeEvaluationRepository repository) {
        this.repository = repository;
    }

    public List<EmployeeEvaluation> findAll() {
        return repository.findAll();
    }

    public EmployeeEvaluation findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public EmployeeEvaluation create(EmployeeEvaluationRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public EmployeeEvaluation update(Integer id, EmployeeEvaluationRequest body) {
        EmployeeEvaluation current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public EmployeeEvaluation save(EmployeeEvaluationRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(EmployeeEvaluationRequest body) {
        repository.delete(toEntity(body));
    }
    private EmployeeEvaluation toEntity(EmployeeEvaluationRequest body) {
        EmployeeEvaluation entity = new EmployeeEvaluation();
        entity.setEvaluationId((Integer) body.get("evaluationId"));
        entity.setEvaluatorId((Integer) body.get("evaluatorId"));
        entity.setEmployeeId((Integer) body.get("employeeId"));
        entity.setStoreId((Integer) body.get("storeId"));
        entity.setShiftByDateId((Integer) body.get("shiftByDateId"));
        entity.setPeriodStart((LocalDate) body.get("periodStart"));
        entity.setPeriodEnd((LocalDate) body.get("periodEnd"));
        entity.setTotalScore((BigDecimal) body.get("totalScore"));
        entity.setFinalRating((String) body.get("finalRating"));
        entity.setStatus((String) body.get("status"));
        return entity;
    }

    private void applyFields(EmployeeEvaluation entity, EmployeeEvaluationRequest body) {
        entity.setEvaluationId((Integer) body.get("evaluationId"));
        entity.setEvaluatorId((Integer) body.get("evaluatorId"));
        entity.setEmployeeId((Integer) body.get("employeeId"));
        entity.setStoreId((Integer) body.get("storeId"));
        entity.setShiftByDateId((Integer) body.get("shiftByDateId"));
        entity.setPeriodStart((LocalDate) body.get("periodStart"));
        entity.setPeriodEnd((LocalDate) body.get("periodEnd"));
        entity.setTotalScore((BigDecimal) body.get("totalScore"));
        entity.setFinalRating((String) body.get("finalRating"));
        entity.setStatus((String) body.get("status"));
    }
}
