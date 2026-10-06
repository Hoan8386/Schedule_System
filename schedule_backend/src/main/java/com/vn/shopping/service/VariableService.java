package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.Variable;
import com.vn.shopping.repository.VariableRepository;
import org.springframework.stereotype.Service;

@Service
public class VariableService extends CrudService<Variable, Integer> {
    public VariableService(VariableRepository repository, ObjectMapper mapper) {
        super(repository, mapper, Variable.class);
    }
}
