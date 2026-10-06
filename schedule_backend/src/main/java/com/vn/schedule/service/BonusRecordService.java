package com.vn.schedule.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.schedule.domain.BonusRecord;
import com.vn.schedule.repository.BonusRecordRepository;

import org.springframework.stereotype.Service;

@Service
public class BonusRecordService extends CrudService<BonusRecord, Integer> {
    public BonusRecordService(BonusRecordRepository repository, ObjectMapper mapper) {
        super(repository, mapper, BonusRecord.class);
    }
}
