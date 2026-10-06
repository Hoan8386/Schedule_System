package com.vn.schedule.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.schedule.domain.TestOption;
import com.vn.schedule.repository.TestOptionRepository;

import org.springframework.stereotype.Service;

@Service
public class TestOptionService extends CrudService<TestOption, Integer> {
    public TestOptionService(TestOptionRepository repository, ObjectMapper mapper) {
        super(repository, mapper, TestOption.class);
    }
}
