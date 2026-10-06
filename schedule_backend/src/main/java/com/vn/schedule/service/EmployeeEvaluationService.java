package com.vn.schedule.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.schedule.domain.EmployeeEvaluation;
import com.vn.schedule.repository.EmployeeEvaluationRepository;

import org.springframework.stereotype.Service;

@Service
public class EmployeeEvaluationService extends CrudService<EmployeeEvaluation, Integer> {
    public EmployeeEvaluationService(EmployeeEvaluationRepository repository, ObjectMapper mapper) {
        super(repository, mapper, EmployeeEvaluation.class);
    }
}
