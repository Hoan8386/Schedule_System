package com.vn.schedule.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.schedule.domain.EmployeeWorkSummary;
import com.vn.schedule.repository.EmployeeWorkSummaryRepository;

import org.springframework.stereotype.Service;

@Service
public class EmployeeWorkSummaryService extends CrudService<EmployeeWorkSummary, Integer> {
    public EmployeeWorkSummaryService(EmployeeWorkSummaryRepository repository, ObjectMapper mapper) {
        super(repository, mapper, EmployeeWorkSummary.class);
    }
}
