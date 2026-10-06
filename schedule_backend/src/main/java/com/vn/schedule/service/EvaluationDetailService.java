package com.vn.schedule.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.schedule.domain.EvaluationDetail;
import com.vn.schedule.repository.EvaluationDetailRepository;

import org.springframework.stereotype.Service;

@Service
public class EvaluationDetailService extends CrudService<EvaluationDetail, Integer> {
    public EvaluationDetailService(EvaluationDetailRepository repository, ObjectMapper mapper) {
        super(repository, mapper, EvaluationDetail.class);
    }
}
