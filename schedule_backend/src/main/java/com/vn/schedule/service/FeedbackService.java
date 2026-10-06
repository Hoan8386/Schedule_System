package com.vn.schedule.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.schedule.domain.Feedback;
import com.vn.schedule.repository.FeedbackRepository;

import org.springframework.stereotype.Service;

@Service
public class FeedbackService extends CrudService<Feedback, Integer> {
    public FeedbackService(FeedbackRepository repository, ObjectMapper mapper) {
        super(repository, mapper, Feedback.class);
    }
}
