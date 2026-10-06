package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.EventScope;
import com.vn.shopping.repository.EventScopeRepository;
import org.springframework.stereotype.Service;

@Service
public class EventScopeService extends CrudService<EventScope, Integer> {
    public EventScopeService(EventScopeRepository repository, ObjectMapper mapper) {
        super(repository, mapper, EventScope.class);
    }
}
