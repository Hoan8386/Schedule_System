package com.vn.schedule.service;

import com.vn.schedule.domain.Shift;
import com.vn.schedule.domain.Store;
import com.vn.schedule.repository.ShiftRepository;
import com.vn.schedule.repository.StoreRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.ShiftRequest;
import java.math.BigDecimal;
import java.time.LocalTime;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ShiftService {
    private final ShiftRepository repository;
    private final StoreRepository storeRepository;

    public ShiftService(ShiftRepository repository, StoreRepository storeRepository) {
        this.repository = repository;
        this.storeRepository = storeRepository;
    }

    public List<Shift> findAll() {
        return repository.findAll();
    }

    public Shift findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public Shift create(ShiftRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public Shift update(Integer id, ShiftRequest body) {
        Shift current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public Shift save(ShiftRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(ShiftRequest body) {
        repository.delete(toEntity(body));
    }
    private Shift toEntity(ShiftRequest body) {
        Shift entity = new Shift();
        entity.setId((Integer) body.get("id"));
        entity.setStore(resolveStore(body));
        entity.setShiftCode((String) body.get("shiftCode"));
        entity.setShiftName((String) body.get("shiftName"));
        entity.setStartTime((LocalTime) body.get("startTime"));
        entity.setEndTime((LocalTime) body.get("endTime"));
        entity.setMaxCapacity((Integer) body.get("maxCapacity"));
        entity.setPayRate((BigDecimal) body.get("payRate"));
        entity.setStatus((String) body.get("status"));
        entity.setNote((String) body.get("note"));
        entity.setCreatedBy((Integer) body.get("createdBy"));
        return entity;
    }

    private void applyFields(Shift entity, ShiftRequest body) {
        entity.setId((Integer) body.get("id"));
        entity.setStore(resolveStore(body));
        entity.setShiftCode((String) body.get("shiftCode"));
        entity.setShiftName((String) body.get("shiftName"));
        entity.setStartTime((LocalTime) body.get("startTime"));
        entity.setEndTime((LocalTime) body.get("endTime"));
        entity.setMaxCapacity((Integer) body.get("maxCapacity"));
        entity.setPayRate((BigDecimal) body.get("payRate"));
        entity.setStatus((String) body.get("status"));
        entity.setNote((String) body.get("note"));
        entity.setCreatedBy((Integer) body.get("createdBy"));
    }

    private Store resolveStore(ShiftRequest body) {
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
