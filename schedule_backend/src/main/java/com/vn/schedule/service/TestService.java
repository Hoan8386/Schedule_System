package com.vn.schedule.service;

import com.vn.schedule.domain.Test;
import com.vn.schedule.repository.TestRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.request.TestRequest;
import java.time.LocalDateTime;
import java.math.BigDecimal;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TestService {
    private final TestRepository repository;
    public TestService(TestRepository repository) {
        this.repository = repository;
    }

    public List<Test> findAll() {
        return repository.findAll();
    }

    public Test findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public Test create(TestRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public Test update(Integer id, TestRequest body) {
        Test current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public Test save(TestRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(TestRequest body) {
        repository.delete(toEntity(body));
    }

    private Test toEntity(TestRequest body) {
        Test entity = new Test();
        applyFields(entity, body);
        return entity;
    }

    private void applyFields(Test entity, TestRequest body) {
        if (body.get("testId") != null) entity.setTestId(toInteger(body.get("testId")));
        if (body.get("testCode") != null) entity.setTestCode(String.valueOf(body.get("testCode")));
        if (body.get("testName") != null) entity.setTestName(String.valueOf(body.get("testName")));
        if (body.get("description") != null) entity.setDescription(String.valueOf(body.get("description")));
        if (body.get("targetRoleId") != null) entity.setTargetRoleId(toInteger(body.get("targetRoleId")));
        if (body.get("durationMinutes") != null) entity.setDurationMinutes(toInteger(body.get("durationMinutes")));
        if (body.get("passingScore") != null) entity.setPassingScore(toBigDecimal(body.get("passingScore")));
        if (body.get("status") != null) entity.setStatus(String.valueOf(body.get("status")));
        if (body.get("createdBy") != null) entity.setCreatedBy(toInteger(body.get("createdBy")));
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
}
