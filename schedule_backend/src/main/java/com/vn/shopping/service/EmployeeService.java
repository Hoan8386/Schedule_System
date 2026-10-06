package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.Employee;
import com.vn.shopping.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

@Service
public class EmployeeService extends CrudService<Employee, Integer> {
    public EmployeeService(EmployeeRepository repository, ObjectMapper mapper) {
        super(repository, mapper, Employee.class);
    }
}
