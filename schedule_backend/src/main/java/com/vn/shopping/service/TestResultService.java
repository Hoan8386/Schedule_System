package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.TestResult;
import com.vn.shopping.repository.TestResultRepository;
import org.springframework.stereotype.Service;

@Service
public class TestResultService extends CrudService<TestResult, Integer> {
    public TestResultService(TestResultRepository repository, ObjectMapper mapper) {
        super(repository, mapper, TestResult.class);
    }
}
