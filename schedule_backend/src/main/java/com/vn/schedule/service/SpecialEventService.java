package com.vn.schedule.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.schedule.domain.SpecialEvent;
import com.vn.schedule.repository.SpecialEventRepository;

import org.springframework.stereotype.Service;

@Service
public class SpecialEventService extends CrudService<SpecialEvent, Integer> {
    public SpecialEventService(SpecialEventRepository repository, ObjectMapper mapper) {
        super(repository, mapper, SpecialEvent.class);
    }
}
