package com.vn.schedule.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.schedule.domain.ShiftByDate;
import com.vn.schedule.repository.ShiftByDateRepository;

import org.springframework.stereotype.Service;

@Service
public class ShiftByDateService extends CrudService<ShiftByDate, Integer> {
    public ShiftByDateService(ShiftByDateRepository repository, ObjectMapper mapper) {
        super(repository, mapper, ShiftByDate.class);
    }
}
