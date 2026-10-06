package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.Test;
import com.vn.shopping.repository.TestRepository;
import org.springframework.stereotype.Service;

@Service
public class TestService extends CrudService<Test, Integer> {
    public TestService(TestRepository repository, ObjectMapper mapper) {
        super(repository, mapper, Test.class);
    }
}
