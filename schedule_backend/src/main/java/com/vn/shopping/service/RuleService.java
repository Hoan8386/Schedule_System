package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.Rule;
import com.vn.shopping.repository.RuleRepository;
import org.springframework.stereotype.Service;

@Service
public class RuleService extends CrudService<Rule, Integer> {
    public RuleService(RuleRepository repository, ObjectMapper mapper) {
        super(repository, mapper, Rule.class);
    }
}
