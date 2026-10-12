package com.vn.schedule.service;

import com.vn.schedule.domain.TestOption;
import com.vn.schedule.repository.TestOptionRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.request.TestOptionRequest;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TestOptionService {
    private final TestOptionRepository repository;
    public TestOptionService(TestOptionRepository repository) {
        this.repository = repository;
    }

    public List<TestOption> findAll() {
        return repository.findAll();
    }

    public TestOption findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public TestOption create(TestOptionRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public TestOption update(Integer id, TestOptionRequest body) {
        TestOption current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public TestOption save(TestOptionRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(TestOptionRequest body) {
        repository.delete(toEntity(body));
    }
    private TestOption toEntity(TestOptionRequest body) {
        TestOption entity = new TestOption();
        applyFields(entity, body);
        return entity;
    }

    private void applyFields(TestOption entity, TestOptionRequest body) {
        if (body.get("optionId") != null) entity.setOptionId(toInteger(body.get("optionId")));
        if (body.get("questionId") != null) entity.setQuestionId(toInteger(body.get("questionId")));
        if (body.get("optionText") != null) entity.setOptionText(String.valueOf(body.get("optionText")));
        if (body.get("isCorrect") != null) entity.setIsCorrect(toBoolean(body.get("isCorrect")));
        if (body.get("displayOrder") != null) entity.setDisplayOrder(toInteger(body.get("displayOrder")));
    }

    private Integer toInteger(Object value) {
        if (value == null) return null;
        if (value instanceof Number n) return n.intValue();
        try { return Integer.parseInt(value.toString()); } catch (Exception e) { return null; }
    }

    private Boolean toBoolean(Object value) {
        if (value == null) return null;
        if (value instanceof Boolean b) return b;
        return Boolean.parseBoolean(value.toString());
    }
}
