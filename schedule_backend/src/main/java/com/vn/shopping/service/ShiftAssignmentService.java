package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.ShiftAssignment;
import com.vn.shopping.repository.ShiftAssignmentRepository;
import org.springframework.stereotype.Service;

@Service
public class ShiftAssignmentService extends CrudService<ShiftAssignment, Integer> {
    public ShiftAssignmentService(ShiftAssignmentRepository repository, ObjectMapper mapper) {
        super(repository, mapper, ShiftAssignment.class);
    }
}
