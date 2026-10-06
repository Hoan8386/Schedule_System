package com.vn.schedule.service;

import com.vn.schedule.domain.TestOption;
import com.vn.schedule.repository.TestOptionRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.TestOptionRequest;

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
        entity.setOptionId((Integer) body.get("optionId"));
        entity.setQuestionId((Integer) body.get("questionId"));
        entity.setOptionText((String) body.get("optionText"));
        entity.setIsCorrect((Boolean) body.get("isCorrect"));
        entity.setDisplayOrder((Integer) body.get("displayOrder"));
        return entity;
    }

    private void applyFields(TestOption entity, TestOptionRequest body) {
        entity.setOptionId((Integer) body.get("optionId"));
        entity.setQuestionId((Integer) body.get("questionId"));
        entity.setOptionText((String) body.get("optionText"));
        entity.setIsCorrect((Boolean) body.get("isCorrect"));
        entity.setDisplayOrder((Integer) body.get("displayOrder"));
    }
}
