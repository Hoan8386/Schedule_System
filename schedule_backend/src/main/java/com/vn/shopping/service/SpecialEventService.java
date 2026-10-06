package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.SpecialEvent;
import com.vn.shopping.repository.SpecialEventRepository;
import org.springframework.stereotype.Service;

@Service
public class SpecialEventService extends CrudService<SpecialEvent, Integer> {
    public SpecialEventService(SpecialEventRepository repository, ObjectMapper mapper) {
        super(repository, mapper, SpecialEvent.class);
    }
}
