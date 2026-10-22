package com.vn.schedule.service;

import com.vn.schedule.domain.TestAssignment;
import com.vn.schedule.repository.TestAssignmentRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.request.TestAssignmentRequest;
import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TestAssignmentService {
    private final TestAssignmentRepository repository;
    private final StoreScopeService storeScopeService;
    public TestAssignmentService(TestAssignmentRepository repository, StoreScopeService storeScopeService) {
        this.repository = repository;
        this.storeScopeService = storeScopeService;
    }

    public List<TestAssignment> findAll() {
        // Bài giao gần nhất trước
        return repository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Order.desc("assignedAt"), org.springframework.data.domain.Sort.Order.desc("testAssignmentId"))).stream()
                .filter(item -> !storeScopeService.isCurrentUserRole("EMPLOYEE")
                        || item.getEmployeeId().equals(storeScopeService.currentEmployeeId()))
                .toList();
    }

    public TestAssignment findById(Integer id) {
        TestAssignment item = repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
        if (storeScopeService.isCurrentUserRole("EMPLOYEE")
                && !item.getEmployeeId().equals(storeScopeService.currentEmployeeId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Bạn chỉ được xem bài kiểm tra của mình");
        }
        return item;
    }

    @Transactional
    public TestAssignment create(TestAssignmentRequest body) {
        TestAssignment item = toEntity(body);
        if (storeScopeService.isCurrentUserRole("EMPLOYEE")) {
            item.setEmployeeId(storeScopeService.currentEmployeeId());
        }
        return repository.save(item);
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
        applyFields(entity, body);
        return entity;
    }

    private void applyFields(TestAssignment entity, TestAssignmentRequest body) {
        if (body.get("testAssignmentId") != null) entity.setTestAssignmentId(toInteger(body.get("testAssignmentId")));
        if (body.get("testId") != null) entity.setTestId(toInteger(body.get("testId")));
        if (body.get("employeeId") != null) entity.setEmployeeId(toInteger(body.get("employeeId")));
        if (body.get("assignedBy") != null) entity.setAssignedBy(toInteger(body.get("assignedBy")));
        if (body.get("assignedAt") != null) entity.setAssignedAt(toLocalDateTime(body.get("assignedAt")));
        if (body.get("dueAt") != null) entity.setDueAt(toLocalDateTime(body.get("dueAt")));
        if (body.get("status") != null) entity.setStatus(String.valueOf(body.get("status")));
    }

    private Integer toInteger(Object value) {
        if (value == null) return null;
        if (value instanceof Number n) return n.intValue();
        try { return Integer.parseInt(value.toString()); } catch (Exception e) { return null; }
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
