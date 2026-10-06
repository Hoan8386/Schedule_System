package com.vn.schedule.service;

import com.vn.schedule.domain.StoreManager;
import com.vn.schedule.repository.StoreManagerRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.StoreManagerRequest;
import java.time.LocalDateTime;
import java.time.LocalDate;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StoreManagerService {
    private final StoreManagerRepository repository;
    public StoreManagerService(StoreManagerRepository repository) {
        this.repository = repository;
    }

    public List<StoreManager> findAll() {
        return repository.findAll();
    }

    public StoreManager findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public StoreManager create(StoreManagerRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public StoreManager update(Integer id, StoreManagerRequest body) {
        StoreManager current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public StoreManager save(StoreManagerRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(StoreManagerRequest body) {
        repository.delete(toEntity(body));
    }
    private StoreManager toEntity(StoreManagerRequest body) {
        StoreManager entity = new StoreManager();
        entity.setStoreManagerId((Integer) body.get("storeManagerId"));
        entity.setStoreId((Integer) body.get("storeId"));
        entity.setEmployeeId((Integer) body.get("employeeId"));
        entity.setStartDate((LocalDate) body.get("startDate"));
        entity.setEndDate((LocalDate) body.get("endDate"));
        entity.setStatus((String) body.get("status"));
        entity.setAssignedBy((Integer) body.get("assignedBy"));
        entity.setNote((String) body.get("note"));
        return entity;
    }

    private void applyFields(StoreManager entity, StoreManagerRequest body) {
        entity.setStoreManagerId((Integer) body.get("storeManagerId"));
        entity.setStoreId((Integer) body.get("storeId"));
        entity.setEmployeeId((Integer) body.get("employeeId"));
        entity.setStartDate((LocalDate) body.get("startDate"));
        entity.setEndDate((LocalDate) body.get("endDate"));
        entity.setStatus((String) body.get("status"));
        entity.setAssignedBy((Integer) body.get("assignedBy"));
        entity.setNote((String) body.get("note"));
    }
}
