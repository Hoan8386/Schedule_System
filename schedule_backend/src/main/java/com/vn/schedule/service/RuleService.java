package com.vn.schedule.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.schedule.domain.Rule;
import com.vn.schedule.repository.RuleRepository;

import org.springframework.stereotype.Service;

@Service
public class RuleService extends CrudService<Rule, Integer> {
    public RuleService(RuleRepository repository, ObjectMapper mapper) {
        super(repository, mapper, Rule.class);
    }
}
