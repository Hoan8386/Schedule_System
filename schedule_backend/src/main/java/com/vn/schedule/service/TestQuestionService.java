package com.vn.schedule.service;

import com.vn.schedule.domain.TestQuestion;
import com.vn.schedule.repository.TestQuestionRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.TestQuestionRequest;
import java.math.BigDecimal;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TestQuestionService {
    private final TestQuestionRepository repository;
    public TestQuestionService(TestQuestionRepository repository) {
        this.repository = repository;
    }

    public List<TestQuestion> findAll() {
        return repository.findAll();
    }

    public TestQuestion findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public TestQuestion create(TestQuestionRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public TestQuestion update(Integer id, TestQuestionRequest body) {
        TestQuestion current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public TestQuestion save(TestQuestionRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(TestQuestionRequest body) {
        repository.delete(toEntity(body));
    }
    private TestQuestion toEntity(TestQuestionRequest body) {
        TestQuestion entity = new TestQuestion();
        entity.setQuestionId((Integer) body.get("questionId"));
        entity.setTestId((Integer) body.get("testId"));
        entity.setQuestionText((String) body.get("questionText"));
        entity.setQuestionType((String) body.get("questionType"));
        entity.setScore((BigDecimal) body.get("score"));
        entity.setDisplayOrder((Integer) body.get("displayOrder"));
        return entity;
    }

    private void applyFields(TestQuestion entity, TestQuestionRequest body) {
        entity.setQuestionId((Integer) body.get("questionId"));
        entity.setTestId((Integer) body.get("testId"));
        entity.setQuestionText((String) body.get("questionText"));
        entity.setQuestionType((String) body.get("questionType"));
        entity.setScore((BigDecimal) body.get("score"));
        entity.setDisplayOrder((Integer) body.get("displayOrder"));
    }
}
