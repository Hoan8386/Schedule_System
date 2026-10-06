package com.vn.schedule.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.schedule.domain.Employee;
import com.vn.schedule.repository.EmployeeRepository;

import org.springframework.stereotype.Service;

@Service
public class EmployeeService extends CrudService<Employee, Integer> {
    public EmployeeService(EmployeeRepository repository, ObjectMapper mapper) {
        super(repository, mapper, Employee.class);
    }
}
