package com.vn.schedule.service;

import com.vn.schedule.domain.Test;
import com.vn.schedule.repository.TestRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.TestRequest;
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
        entity.setTestId((Integer) body.get("testId"));
        entity.setTestCode((String) body.get("testCode"));
        entity.setTestName((String) body.get("testName"));
        entity.setDescription((String) body.get("description"));
        entity.setTargetRoleId((Integer) body.get("targetRoleId"));
        entity.setDurationMinutes((Integer) body.get("durationMinutes"));
        entity.setPassingScore((BigDecimal) body.get("passingScore"));
        entity.setStatus((String) body.get("status"));
        entity.setCreatedBy((Integer) body.get("createdBy"));
        return entity;
    }

    private void applyFields(Test entity, TestRequest body) {
        entity.setTestId((Integer) body.get("testId"));
        entity.setTestCode((String) body.get("testCode"));
        entity.setTestName((String) body.get("testName"));
        entity.setDescription((String) body.get("description"));
        entity.setTargetRoleId((Integer) body.get("targetRoleId"));
        entity.setDurationMinutes((Integer) body.get("durationMinutes"));
        entity.setPassingScore((BigDecimal) body.get("passingScore"));
        entity.setStatus((String) body.get("status"));
        entity.setCreatedBy((Integer) body.get("createdBy"));
    }
}
