package com.vn.schedule.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.schedule.domain.Payroll;
import com.vn.schedule.repository.PayrollRepository;

import org.springframework.stereotype.Service;

@Service
public class PayrollService extends CrudService<Payroll, Integer> {
    public PayrollService(PayrollRepository repository, ObjectMapper mapper) {
        super(repository, mapper, Payroll.class);
    }
}
