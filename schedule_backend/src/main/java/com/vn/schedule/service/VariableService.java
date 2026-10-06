package com.vn.schedule.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.schedule.domain.Variable;
import com.vn.schedule.repository.VariableRepository;

import org.springframework.stereotype.Service;

@Service
public class VariableService extends CrudService<Variable, Integer> {
    public VariableService(VariableRepository repository, ObjectMapper mapper) {
        super(repository, mapper, Variable.class);
    }
}
