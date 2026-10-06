package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.EmployeeWorkSummary;
import com.vn.shopping.repository.EmployeeWorkSummaryRepository;
import org.springframework.stereotype.Service;

@Service
public class EmployeeWorkSummaryService extends CrudService<EmployeeWorkSummary, Integer> {
    public EmployeeWorkSummaryService(EmployeeWorkSummaryRepository repository, ObjectMapper mapper) {
        super(repository, mapper, EmployeeWorkSummary.class);
    }
}
