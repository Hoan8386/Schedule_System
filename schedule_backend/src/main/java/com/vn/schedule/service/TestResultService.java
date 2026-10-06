package com.vn.schedule.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.schedule.domain.TestResult;
import com.vn.schedule.repository.TestResultRepository;

import org.springframework.stereotype.Service;

@Service
public class TestResultService extends CrudService<TestResult, Integer> {
    public TestResultService(TestResultRepository repository, ObjectMapper mapper) {
        super(repository, mapper, TestResult.class);
    }
}
