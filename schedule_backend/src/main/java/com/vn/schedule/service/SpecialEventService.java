package com.vn.schedule.service;

import com.vn.schedule.domain.SpecialEvent;
import com.vn.schedule.repository.SpecialEventRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.request.SpecialEventRequest;
import java.time.LocalDateTime;
import java.time.LocalDate;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SpecialEventService {
    private final SpecialEventRepository repository;
    public SpecialEventService(SpecialEventRepository repository) {
        this.repository = repository;
    }

    public List<SpecialEvent> findAll() {
        return repository.findAll();
    }

    public SpecialEvent findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public SpecialEvent create(SpecialEventRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public SpecialEvent update(Integer id, SpecialEventRequest body) {
        SpecialEvent current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public SpecialEvent save(SpecialEventRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(SpecialEventRequest body) {
        repository.delete(toEntity(body));
    }
    private SpecialEvent toEntity(SpecialEventRequest body) {
        SpecialEvent entity = new SpecialEvent();
        entity.setEventId((Integer) body.get("eventId"));
        entity.setEventName((String) body.get("eventName"));
        entity.setDescription((String) body.get("description"));
        entity.setEventType((String) body.get("eventType"));
        entity.setStartDate((LocalDate) body.get("startDate"));
        entity.setEndDate((LocalDate) body.get("endDate"));
        entity.setStatus((String) body.get("status"));
        entity.setCreatedBy((Integer) body.get("createdBy"));
        return entity;
    }

    private void applyFields(SpecialEvent entity, SpecialEventRequest body) {
        entity.setEventId((Integer) body.get("eventId"));
        entity.setEventName((String) body.get("eventName"));
        entity.setDescription((String) body.get("description"));
        entity.setEventType((String) body.get("eventType"));
        entity.setStartDate((LocalDate) body.get("startDate"));
        entity.setEndDate((LocalDate) body.get("endDate"));
        entity.setStatus((String) body.get("status"));
        entity.setCreatedBy((Integer) body.get("createdBy"));
    }
}
