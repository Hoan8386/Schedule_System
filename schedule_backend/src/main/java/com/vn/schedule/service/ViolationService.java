package com.vn.schedule.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.schedule.domain.Violation;
import com.vn.schedule.repository.ViolationRepository;

import org.springframework.stereotype.Service;

@Service
public class ViolationService extends CrudService<Violation, Integer> {
    public ViolationService(ViolationRepository repository, ObjectMapper mapper) {
        super(repository, mapper, Violation.class);
    }
}
