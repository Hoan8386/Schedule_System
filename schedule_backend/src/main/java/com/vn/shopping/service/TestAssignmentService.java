package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.TestAssignment;
import com.vn.shopping.repository.TestAssignmentRepository;
import org.springframework.stereotype.Service;

@Service
public class TestAssignmentService extends CrudService<TestAssignment, Integer> {
    public TestAssignmentService(TestAssignmentRepository repository, ObjectMapper mapper) {
        super(repository, mapper, TestAssignment.class);
    }
}
