package com.vn.schedule.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.schedule.domain.BonusDetail;
import com.vn.schedule.repository.BonusDetailRepository;

import org.springframework.stereotype.Service;

@Service
public class BonusDetailService extends CrudService<BonusDetail, Integer> {
    public BonusDetailService(BonusDetailRepository repository, ObjectMapper mapper) {
        super(repository, mapper, BonusDetail.class);
    }
}
