package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.RegulationsRule;
import com.vn.shopping.repository.RegulationsRuleRepository;
import org.springframework.stereotype.Service;

@Service
public class RegulationsRuleService extends CrudService<RegulationsRule, Integer> {
    public RegulationsRuleService(RegulationsRuleRepository repository, ObjectMapper mapper) {
        super(repository, mapper, RegulationsRule.class);
    }
}
