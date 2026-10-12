package com.vn.schedule.service;

import com.vn.schedule.domain.TestResult;
import com.vn.schedule.repository.TestResultRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.request.TestResultRequest;
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
        applyFields(entity, body);
        return entity;
    }

    private void applyFields(TestResult entity, TestResultRequest body) {
        if (body.get("testResultId") != null) entity.setTestResultId(toInteger(body.get("testResultId")));
        if (body.get("testAssignmentId") != null) entity.setTestAssignmentId(toInteger(body.get("testAssignmentId")));
        if (body.get("score") != null) entity.setScore(toBigDecimal(body.get("score")));
        if (body.get("passed") != null) entity.setPassed(toBoolean(body.get("passed")));
        if (body.get("startedAt") != null) entity.setStartedAt(toLocalDateTime(body.get("startedAt")));
        if (body.get("submittedAt") != null) entity.setSubmittedAt(toLocalDateTime(body.get("submittedAt")));
        if (body.get("gradedBy") != null) entity.setGradedBy(toInteger(body.get("gradedBy")));
        if (body.get("gradedAt") != null) entity.setGradedAt(toLocalDateTime(body.get("gradedAt")));
    }

    private Integer toInteger(Object value) {
        if (value == null) return null;
        if (value instanceof Number n) return n.intValue();
        try { return Integer.parseInt(value.toString()); } catch (Exception e) { return null; }
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value == null) return null;
        if (value instanceof BigDecimal bd) return bd;
        if (value instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
        try { return new BigDecimal(value.toString()); } catch (Exception e) { return null; }
    }

    private Boolean toBoolean(Object value) {
        if (value == null) return null;
        if (value instanceof Boolean b) return b;
        return Boolean.parseBoolean(value.toString());
    }

    private LocalDateTime toLocalDateTime(Object value) {
        if (value == null) return null;
        if (value instanceof LocalDateTime ldt) return ldt;
        try {
            String str = value.toString().replace("Z", "");
            return LocalDateTime.parse(str);
        } catch (Exception e) {
            return null;
        }
    }
}
