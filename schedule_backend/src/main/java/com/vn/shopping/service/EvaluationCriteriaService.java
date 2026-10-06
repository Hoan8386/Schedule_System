package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.EvaluationCriteria;
import com.vn.shopping.repository.EvaluationCriteriaRepository;
import org.springframework.stereotype.Service;

@Service
public class EvaluationCriteriaService extends CrudService<EvaluationCriteria, Integer> {
    public EvaluationCriteriaService(EvaluationCriteriaRepository repository, ObjectMapper mapper) {
        super(repository, mapper, EvaluationCriteria.class);
    }
}
