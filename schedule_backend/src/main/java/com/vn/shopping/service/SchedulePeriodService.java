package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.SchedulePeriod;
import com.vn.shopping.repository.SchedulePeriodRepository;
import org.springframework.stereotype.Service;

@Service
public class SchedulePeriodService extends CrudService<SchedulePeriod, Integer> {
    public SchedulePeriodService(SchedulePeriodRepository repository, ObjectMapper mapper) {
        super(repository, mapper, SchedulePeriod.class);
    }
}
