package com.vn.schedule.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.schedule.domain.RegulationsRule;
import com.vn.schedule.repository.RegulationsRuleRepository;

import org.springframework.stereotype.Service;

@Service
public class RegulationsRuleService extends CrudService<RegulationsRule, Integer> {
    public RegulationsRuleService(RegulationsRuleRepository repository, ObjectMapper mapper) {
        super(repository, mapper, RegulationsRule.class);
    }
}
