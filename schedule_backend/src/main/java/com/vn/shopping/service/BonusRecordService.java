package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.BonusRecord;
import com.vn.shopping.repository.BonusRecordRepository;
import org.springframework.stereotype.Service;

@Service
public class BonusRecordService extends CrudService<BonusRecord, Integer> {
    public BonusRecordService(BonusRecordRepository repository, ObjectMapper mapper) {
        super(repository, mapper, BonusRecord.class);
    }
}
