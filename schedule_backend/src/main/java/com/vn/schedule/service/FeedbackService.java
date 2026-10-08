package com.vn.schedule.service;

import com.vn.schedule.domain.Feedback;
import com.vn.schedule.repository.FeedbackRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.request.FeedbackRequest;
import java.time.LocalDateTime;
import java.math.BigDecimal;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FeedbackService {
    private final FeedbackRepository repository;
    public FeedbackService(FeedbackRepository repository) {
        this.repository = repository;
    }

    public List<Feedback> findAll() {
        return repository.findAll();
    }

    public Feedback findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public Feedback create(FeedbackRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public Feedback update(Integer id, FeedbackRequest body) {
        Feedback current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public Feedback save(FeedbackRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(FeedbackRequest body) {
        repository.delete(toEntity(body));
    }
    private Feedback toEntity(FeedbackRequest body) {
        Feedback entity = new Feedback();
        entity.setFeedbackId((Integer) body.get("feedbackId"));
        entity.setEmployeeId((Integer) body.get("employeeId"));
        entity.setStoreId((Integer) body.get("storeId"));
        entity.setShiftByDateId((Integer) body.get("shiftByDateId"));
        entity.setFeedbackType((String) body.get("feedbackType"));
        entity.setTargetEmployeeId((Integer) body.get("targetEmployeeId"));
        entity.setRating((BigDecimal) body.get("rating"));
        entity.setContent((String) body.get("content"));
        entity.setStatus((String) body.get("status"));
        entity.setHandledBy((Integer) body.get("handledBy"));
        entity.setHandledAt((LocalDateTime) body.get("handledAt"));
        entity.setResponse((String) body.get("response"));
        return entity;
    }

    private void applyFields(Feedback entity, FeedbackRequest body) {
        entity.setFeedbackId((Integer) body.get("feedbackId"));
        entity.setEmployeeId((Integer) body.get("employeeId"));
        entity.setStoreId((Integer) body.get("storeId"));
        entity.setShiftByDateId((Integer) body.get("shiftByDateId"));
        entity.setFeedbackType((String) body.get("feedbackType"));
        entity.setTargetEmployeeId((Integer) body.get("targetEmployeeId"));
        entity.setRating((BigDecimal) body.get("rating"));
        entity.setContent((String) body.get("content"));
        entity.setStatus((String) body.get("status"));
        entity.setHandledBy((Integer) body.get("handledBy"));
        entity.setHandledAt((LocalDateTime) body.get("handledAt"));
        entity.setResponse((String) body.get("response"));
    }
}
