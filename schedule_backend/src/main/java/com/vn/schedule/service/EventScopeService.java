package com.vn.schedule.service;

import com.vn.schedule.domain.EventScope;
import com.vn.schedule.repository.EventScopeRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.EventScopeRequest;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EventScopeService {
    private final EventScopeRepository repository;
    public EventScopeService(EventScopeRepository repository) {
        this.repository = repository;
    }

    public List<EventScope> findAll() {
        return repository.findAll();
    }

    public EventScope findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public EventScope create(EventScopeRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public EventScope update(Integer id, EventScopeRequest body) {
        EventScope current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public EventScope save(EventScopeRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(EventScopeRequest body) {
        repository.delete(toEntity(body));
    }
    private EventScope toEntity(EventScopeRequest body) {
        EventScope entity = new EventScope();
        entity.setEventScopeId((Integer) body.get("eventScopeId"));
        entity.setEventId((Integer) body.get("eventId"));
        entity.setScopeType((String) body.get("scopeType"));
        entity.setSchedulePeriodId((Integer) body.get("schedulePeriodId"));
        entity.setShiftByDateId((Integer) body.get("shiftByDateId"));
        entity.setStoreId((Integer) body.get("storeId"));
        entity.setDayOfWeek((Integer) body.get("dayOfWeek"));
        entity.setShiftId((Integer) body.get("shiftId"));
        return entity;
    }

    private void applyFields(EventScope entity, EventScopeRequest body) {
        entity.setEventScopeId((Integer) body.get("eventScopeId"));
        entity.setEventId((Integer) body.get("eventId"));
        entity.setScopeType((String) body.get("scopeType"));
        entity.setSchedulePeriodId((Integer) body.get("schedulePeriodId"));
        entity.setShiftByDateId((Integer) body.get("shiftByDateId"));
        entity.setStoreId((Integer) body.get("storeId"));
        entity.setDayOfWeek((Integer) body.get("dayOfWeek"));
        entity.setShiftId((Integer) body.get("shiftId"));
    }
}
