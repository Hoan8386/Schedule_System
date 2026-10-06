package com.vn.schedule.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.schedule.domain.EvaluationCriteria;
import com.vn.schedule.repository.EvaluationCriteriaRepository;

import org.springframework.stereotype.Service;

@Service
public class EvaluationCriteriaService extends CrudService<EvaluationCriteria, Integer> {
    public EvaluationCriteriaService(EvaluationCriteriaRepository repository, ObjectMapper mapper) {
        super(repository, mapper, EvaluationCriteria.class);
    }
}
