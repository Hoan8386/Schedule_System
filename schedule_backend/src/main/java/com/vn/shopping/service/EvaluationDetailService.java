package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.EvaluationDetail;
import com.vn.shopping.repository.EvaluationDetailRepository;
import org.springframework.stereotype.Service;

@Service
public class EvaluationDetailService extends CrudService<EvaluationDetail, Integer> {
    public EvaluationDetailService(EvaluationDetailRepository repository, ObjectMapper mapper) {
        super(repository, mapper, EvaluationDetail.class);
    }
}
