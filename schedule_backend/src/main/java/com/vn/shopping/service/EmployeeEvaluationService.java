package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.EmployeeEvaluation;
import com.vn.shopping.repository.EmployeeEvaluationRepository;
import org.springframework.stereotype.Service;

@Service
public class EmployeeEvaluationService extends CrudService<EmployeeEvaluation, Integer> {
    public EmployeeEvaluationService(EmployeeEvaluationRepository repository, ObjectMapper mapper) {
        super(repository, mapper, EmployeeEvaluation.class);
    }
}
