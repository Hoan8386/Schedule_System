package com.vn.schedule.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.schedule.domain.DisciplinaryRecord;
import com.vn.schedule.repository.DisciplinaryRecordRepository;

import org.springframework.stereotype.Service;

@Service
public class DisciplinaryRecordService extends CrudService<DisciplinaryRecord, Integer> {
    public DisciplinaryRecordService(DisciplinaryRecordRepository repository, ObjectMapper mapper) {
        super(repository, mapper, DisciplinaryRecord.class);
    }
}
