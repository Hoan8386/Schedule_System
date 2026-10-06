package com.vn.schedule.service;

import com.vn.schedule.domain.EmployeeStore;
import com.vn.schedule.repository.EmployeeStoreRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.EmployeeStoreRequest;
import java.time.LocalDateTime;
import java.time.LocalDate;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EmployeeStoreService {
    private final EmployeeStoreRepository repository;
    public EmployeeStoreService(EmployeeStoreRepository repository) {
        this.repository = repository;
    }

    public List<EmployeeStore> findAll() {
        return repository.findAll();
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
        entity.setEmployeeStoreId((Integer) body.get("employeeStoreId"));
        entity.setEmployeeId((Integer) body.get("employeeId"));
        entity.setStoreId((Integer) body.get("storeId"));
        entity.setStartDate((LocalDate) body.get("startDate"));
        entity.setEndDate((LocalDate) body.get("endDate"));
        entity.setIsPrimary((Boolean) body.get("isPrimary"));
        entity.setStatus((String) body.get("status"));
        entity.setAssignedBy((Integer) body.get("assignedBy"));
        return entity;
    }

    private void applyFields(EmployeeStore entity, EmployeeStoreRequest body) {
        entity.setEmployeeStoreId((Integer) body.get("employeeStoreId"));
        entity.setEmployeeId((Integer) body.get("employeeId"));
        entity.setStoreId((Integer) body.get("storeId"));
        entity.setStartDate((LocalDate) body.get("startDate"));
        entity.setEndDate((LocalDate) body.get("endDate"));
        entity.setIsPrimary((Boolean) body.get("isPrimary"));
        entity.setStatus((String) body.get("status"));
        entity.setAssignedBy((Integer) body.get("assignedBy"));
    }
}
