package com.vn.schedule.service;

import com.vn.schedule.domain.TestQuestion;
import com.vn.schedule.repository.TestQuestionRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.request.TestQuestionRequest;
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
        applyFields(entity, body);
        return entity;
    }

    private void applyFields(TestQuestion entity, TestQuestionRequest body) {
        if (body.get("questionId") != null) entity.setQuestionId(toInteger(body.get("questionId")));
        if (body.get("testId") != null) entity.setTestId(toInteger(body.get("testId")));
        if (body.get("questionText") != null) entity.setQuestionText(String.valueOf(body.get("questionText")));
        if (body.get("questionType") != null) entity.setQuestionType(String.valueOf(body.get("questionType")));
        if (body.get("score") != null) entity.setScore(toBigDecimal(body.get("score")));
        if (body.get("displayOrder") != null) entity.setDisplayOrder(toInteger(body.get("displayOrder")));
    }

    private Integer toInteger(Object value) {
        if (value == null) return null;
        if (value instanceof Number n) return n.intValue();
        try { return Integer.parseInt(value.toString()); } catch (Exception e) { return null; }
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value == null) return null;
        if (value instanceof BigDecimal bd) return bd;
        if (value instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
        try { return new BigDecimal(value.toString()); } catch (Exception e) { return null; }
    }
}
