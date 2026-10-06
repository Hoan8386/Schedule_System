package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.ShiftByDate;
import com.vn.shopping.repository.ShiftByDateRepository;
import org.springframework.stereotype.Service;

@Service
public class ShiftByDateService extends CrudService<ShiftByDate, Integer> {
    public ShiftByDateService(ShiftByDateRepository repository, ObjectMapper mapper) {
        super(repository, mapper, ShiftByDate.class);
    }
}
