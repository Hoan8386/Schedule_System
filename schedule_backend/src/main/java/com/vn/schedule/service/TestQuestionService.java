package com.vn.schedule.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.schedule.domain.TestQuestion;
import com.vn.schedule.repository.TestQuestionRepository;

import org.springframework.stereotype.Service;

@Service
public class TestQuestionService extends CrudService<TestQuestion, Integer> {
    public TestQuestionService(TestQuestionRepository repository, ObjectMapper mapper) {
        super(repository, mapper, TestQuestion.class);
    }
}
