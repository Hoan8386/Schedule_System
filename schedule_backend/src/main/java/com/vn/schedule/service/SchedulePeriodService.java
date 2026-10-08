package com.vn.schedule.service;

import com.vn.schedule.domain.SchedulePeriod;
import com.vn.schedule.domain.Store;
import com.vn.schedule.repository.SchedulePeriodRepository;
import com.vn.schedule.repository.StoreRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.request.SchedulePeriodRequest;
import java.time.LocalDateTime;
import java.time.LocalDate;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SchedulePeriodService {
    private final SchedulePeriodRepository repository;
    private final StoreRepository storeRepository;

    public SchedulePeriodService(SchedulePeriodRepository repository, StoreRepository storeRepository) {
        this.repository = repository;
        this.storeRepository = storeRepository;
    }

    public List<SchedulePeriod> findAll() {
        return repository.findAll();
    }

    public SchedulePeriod findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public SchedulePeriod create(SchedulePeriodRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public SchedulePeriod update(Integer id, SchedulePeriodRequest body) {
        SchedulePeriod current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public SchedulePeriod save(SchedulePeriodRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(SchedulePeriodRequest body) {
        repository.delete(toEntity(body));
    }
    private SchedulePeriod toEntity(SchedulePeriodRequest body) {
        SchedulePeriod entity = new SchedulePeriod();
        entity.setId((Integer) body.get("id"));
        entity.setStore(resolveStore(body));
        entity.setPeriodName((String) body.get("periodName"));
        entity.setPeriodType((String) body.get("periodType"));
        entity.setStartDate((LocalDate) body.get("startDate"));
        entity.setEndDate((LocalDate) body.get("endDate"));
        entity.setRegistrationOpenAt((LocalDateTime) body.get("registrationOpenAt"));
        entity.setRegistrationCloseAt((LocalDateTime) body.get("registrationCloseAt"));
        entity.setStatus((String) body.get("status"));
        entity.setCreatedBy((Integer) body.get("createdBy"));
        entity.setFinalizedBy((Integer) body.get("finalizedBy"));
        entity.setFinalizedAt((LocalDateTime) body.get("finalizedAt"));
        return entity;
    }

    private void applyFields(SchedulePeriod entity, SchedulePeriodRequest body) {
        entity.setId((Integer) body.get("id"));
        entity.setStore(resolveStore(body));
        entity.setPeriodName((String) body.get("periodName"));
        entity.setPeriodType((String) body.get("periodType"));
        entity.setStartDate((LocalDate) body.get("startDate"));
        entity.setEndDate((LocalDate) body.get("endDate"));
        entity.setRegistrationOpenAt((LocalDateTime) body.get("registrationOpenAt"));
        entity.setRegistrationCloseAt((LocalDateTime) body.get("registrationCloseAt"));
        entity.setStatus((String) body.get("status"));
        entity.setCreatedBy((Integer) body.get("createdBy"));
        entity.setFinalizedBy((Integer) body.get("finalizedBy"));
        entity.setFinalizedAt((LocalDateTime) body.get("finalizedAt"));
    }

    private Store resolveStore(SchedulePeriodRequest body) {
        return storeRepository.getReferenceById(requiredId(body.get("store"), "store"));
    }

    private Integer requiredId(Object value, String fieldName) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        if (value instanceof java.util.Map<?, ?> map && map.get("id") instanceof Number number) {
            return number.intValue();
        }
        throw new ApiException(HttpStatus.BAD_REQUEST, fieldName + " is required");
    }
}
