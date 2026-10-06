package com.vn.schedule.service;

import com.vn.schedule.domain.TestResult;
import com.vn.schedule.repository.TestResultRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.TestResultRequest;
import java.time.LocalDateTime;
import java.math.BigDecimal;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TestResultService {
    private final TestResultRepository repository;
    public TestResultService(TestResultRepository repository) {
        this.repository = repository;
    }

    public List<TestResult> findAll() {
        return repository.findAll();
    }

    public TestResult findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public TestResult create(TestResultRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public TestResult update(Integer id, TestResultRequest body) {
        TestResult current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public TestResult save(TestResultRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(TestResultRequest body) {
        repository.delete(toEntity(body));
    }
    private TestResult toEntity(TestResultRequest body) {
        TestResult entity = new TestResult();
        entity.setTestResultId((Integer) body.get("testResultId"));
        entity.setTestAssignmentId((Integer) body.get("testAssignmentId"));
        entity.setScore((BigDecimal) body.get("score"));
        entity.setPassed((Boolean) body.get("passed"));
        entity.setStartedAt((LocalDateTime) body.get("startedAt"));
        entity.setSubmittedAt((LocalDateTime) body.get("submittedAt"));
        entity.setGradedBy((Integer) body.get("gradedBy"));
        entity.setGradedAt((LocalDateTime) body.get("gradedAt"));
        return entity;
    }

    private void applyFields(TestResult entity, TestResultRequest body) {
        entity.setTestResultId((Integer) body.get("testResultId"));
        entity.setTestAssignmentId((Integer) body.get("testAssignmentId"));
        entity.setScore((BigDecimal) body.get("score"));
        entity.setPassed((Boolean) body.get("passed"));
        entity.setStartedAt((LocalDateTime) body.get("startedAt"));
        entity.setSubmittedAt((LocalDateTime) body.get("submittedAt"));
        entity.setGradedBy((Integer) body.get("gradedBy"));
        entity.setGradedAt((LocalDateTime) body.get("gradedAt"));
    }
}
