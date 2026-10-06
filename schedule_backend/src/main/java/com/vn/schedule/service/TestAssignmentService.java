package com.vn.schedule.service;

import com.vn.schedule.domain.TestAssignment;
import com.vn.schedule.repository.TestAssignmentRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.TestAssignmentRequest;
import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TestAssignmentService {
    private final TestAssignmentRepository repository;
    public TestAssignmentService(TestAssignmentRepository repository) {
        this.repository = repository;
    }

    public List<TestAssignment> findAll() {
        return repository.findAll();
    }

    public TestAssignment findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public TestAssignment create(TestAssignmentRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public TestAssignment update(Integer id, TestAssignmentRequest body) {
        TestAssignment current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public TestAssignment save(TestAssignmentRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(TestAssignmentRequest body) {
        repository.delete(toEntity(body));
    }
    private TestAssignment toEntity(TestAssignmentRequest body) {
        TestAssignment entity = new TestAssignment();
        entity.setTestAssignmentId((Integer) body.get("testAssignmentId"));
        entity.setTestId((Integer) body.get("testId"));
        entity.setEmployeeId((Integer) body.get("employeeId"));
        entity.setAssignedBy((Integer) body.get("assignedBy"));
        entity.setAssignedAt((LocalDateTime) body.get("assignedAt"));
        entity.setDueAt((LocalDateTime) body.get("dueAt"));
        entity.setStatus((String) body.get("status"));
        return entity;
    }

    private void applyFields(TestAssignment entity, TestAssignmentRequest body) {
        entity.setTestAssignmentId((Integer) body.get("testAssignmentId"));
        entity.setTestId((Integer) body.get("testId"));
        entity.setEmployeeId((Integer) body.get("employeeId"));
        entity.setAssignedBy((Integer) body.get("assignedBy"));
        entity.setAssignedAt((LocalDateTime) body.get("assignedAt"));
        entity.setDueAt((LocalDateTime) body.get("dueAt"));
        entity.setStatus((String) body.get("status"));
    }
}
