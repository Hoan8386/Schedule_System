package com.vn.schedule.service;

import com.vn.schedule.domain.EmployeeStore;
import com.vn.schedule.repository.EmployeeStoreRepository;
import com.vn.schedule.repository.StoreManagerRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.request.EmployeeStoreRequest;
import java.time.LocalDateTime;
import java.time.LocalDate;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
public class EmployeeStoreService {
    private final EmployeeStoreRepository repository;
    private final StoreManagerRepository storeManagerRepository;

    public EmployeeStoreService(
            EmployeeStoreRepository repository,
            StoreManagerRepository storeManagerRepository) {
        this.repository = repository;
        this.storeManagerRepository = storeManagerRepository;
    }

    public List<EmployeeStore> findAll() {
        return repository.findAll();
    }

    public List<EmployeeStore> findByFilters(
            Integer storeId,
            String role,
            String status,
            Boolean primary) {
        Set<String> managerAssignments = storeManagerRepository.findAll().stream()
                .filter(manager -> status == null || status.equalsIgnoreCase(manager.getStatus()))
                .map(manager -> manager.getEmployeeId() + ":" + manager.getStoreId())
                .collect(java.util.stream.Collectors.toSet());

        return repository.findAll().stream()
                .filter(item -> storeId == null || storeId.equals(item.getStoreId()))
                .filter(item -> status == null || status.equalsIgnoreCase(item.getStatus()))
                .filter(item -> primary == null || primary.equals(item.getIsPrimary()))
                .filter(item -> matchesRole(item, role, managerAssignments))
                .toList();
    }

    private boolean matchesRole(EmployeeStore item, String role, Set<String> managerAssignments) {
        if (role == null || role.isBlank() || "ALL".equalsIgnoreCase(role)) {
            return true;
        }
        boolean manager = managerAssignments.contains(item.getEmployeeId() + ":" + item.getStoreId());
        if ("MANAGER".equalsIgnoreCase(role)) {
            return manager;
        }
        if ("EMPLOYEE".equalsIgnoreCase(role) || "STAFF".equalsIgnoreCase(role)) {
            return !manager;
        }
        return false;
    }

    public EmployeeStore findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public EmployeeStore create(EmployeeStoreRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public EmployeeStore update(Integer id, EmployeeStoreRequest body) {
        EmployeeStore current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public EmployeeStore save(EmployeeStoreRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(EmployeeStoreRequest body) {
        repository.delete(toEntity(body));
    }
    private EmployeeStore toEntity(EmployeeStoreRequest body) {
        EmployeeStore entity = new EmployeeStore();
        applyFields(entity, body);
        return entity;
    }

    private void applyFields(EmployeeStore entity, EmployeeStoreRequest body) {
        entity.setEmployeeId(integer(body.get("employeeId")));
        entity.setStoreId(integer(body.get("storeId")));
        entity.setStartDate(localDate(body.get("startDate")));
        entity.setEndDate(localDate(body.get("endDate")));
        entity.setIsPrimary((Boolean) body.get("isPrimary"));
        entity.setStatus((String) body.get("status"));
        entity.setAssignedBy(integer(body.get("assignedBy")));
    }

    private Integer integer(Object value) {
        return value instanceof Number number ? number.intValue() : null;
    }

    private LocalDate localDate(Object value) {
        return value instanceof LocalDate date
                ? date
                : value instanceof String text && !text.isBlank()
                        ? LocalDate.parse(text)
                        : null;
    }
}
