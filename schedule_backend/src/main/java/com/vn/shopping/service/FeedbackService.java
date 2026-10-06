package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.Feedback;
import com.vn.shopping.repository.FeedbackRepository;
import org.springframework.stereotype.Service;

@Service
public class FeedbackService extends CrudService<Feedback, Integer> {
    public FeedbackService(FeedbackRepository repository, ObjectMapper mapper) {
        super(repository, mapper, Feedback.class);
    }
}
