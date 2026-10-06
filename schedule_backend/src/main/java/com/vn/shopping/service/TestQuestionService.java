package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.TestQuestion;
import com.vn.shopping.repository.TestQuestionRepository;
import org.springframework.stereotype.Service;

@Service
public class TestQuestionService extends CrudService<TestQuestion, Integer> {
    public TestQuestionService(TestQuestionRepository repository, ObjectMapper mapper) {
        super(repository, mapper, TestQuestion.class);
    }
}
