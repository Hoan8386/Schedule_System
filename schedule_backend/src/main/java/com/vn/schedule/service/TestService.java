package com.vn.schedule.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.schedule.domain.Test;
import com.vn.schedule.repository.TestRepository;

import org.springframework.stereotype.Service;

@Service
public class TestService extends CrudService<Test, Integer> {
    public TestService(TestRepository repository, ObjectMapper mapper) {
        super(repository, mapper, Test.class);
    }
}
