package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.TestOption;
import com.vn.shopping.repository.TestOptionRepository;
import org.springframework.stereotype.Service;

@Service
public class TestOptionService extends CrudService<TestOption, Integer> {
    public TestOptionService(TestOptionRepository repository, ObjectMapper mapper) {
        super(repository, mapper, TestOption.class);
    }
}
