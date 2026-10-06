package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.Payroll;
import com.vn.shopping.repository.PayrollRepository;
import org.springframework.stereotype.Service;

@Service
public class PayrollService extends CrudService<Payroll, Integer> {
    public PayrollService(PayrollRepository repository, ObjectMapper mapper) {
        super(repository, mapper, Payroll.class);
    }
}
