package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.Shift;
import com.vn.shopping.repository.ShiftRepository;
import org.springframework.stereotype.Service;

@Service
public class ShiftService extends CrudService<Shift, Integer> {
    public ShiftService(ShiftRepository repository, ObjectMapper mapper) {
        super(repository, mapper, Shift.class);
    }
}
