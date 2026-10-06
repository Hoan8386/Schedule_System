package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.Violation;
import com.vn.shopping.repository.ViolationRepository;
import org.springframework.stereotype.Service;

@Service
public class ViolationService extends CrudService<Violation, Integer> {
    public ViolationService(ViolationRepository repository, ObjectMapper mapper) {
        super(repository, mapper, Violation.class);
    }
}
