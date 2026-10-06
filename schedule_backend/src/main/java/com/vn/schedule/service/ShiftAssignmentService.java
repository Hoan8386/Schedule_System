package com.vn.schedule.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.schedule.domain.ShiftAssignment;
import com.vn.schedule.repository.ShiftAssignmentRepository;

import org.springframework.stereotype.Service;

@Service
public class ShiftAssignmentService extends CrudService<ShiftAssignment, Integer> {
    public ShiftAssignmentService(ShiftAssignmentRepository repository, ObjectMapper mapper) {
        super(repository, mapper, ShiftAssignment.class);
    }
}
