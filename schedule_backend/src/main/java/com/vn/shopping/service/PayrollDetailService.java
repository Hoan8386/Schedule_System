package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.PayrollDetail;
import com.vn.shopping.repository.PayrollDetailRepository;
import org.springframework.stereotype.Service;

@Service
public class PayrollDetailService extends CrudService<PayrollDetail, Integer> {
    public PayrollDetailService(PayrollDetailRepository repository, ObjectMapper mapper) {
        super(repository, mapper, PayrollDetail.class);
    }
}
