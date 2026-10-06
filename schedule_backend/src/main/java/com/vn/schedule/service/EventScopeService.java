package com.vn.schedule.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.schedule.domain.EventScope;
import com.vn.schedule.repository.EventScopeRepository;

import org.springframework.stereotype.Service;

@Service
public class EventScopeService extends CrudService<EventScope, Integer> {
    public EventScopeService(EventScopeRepository repository, ObjectMapper mapper) {
        super(repository, mapper, EventScope.class);
    }
}
