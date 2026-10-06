package com.vn.schedule.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.schedule.domain.EmployeeStore;
import com.vn.schedule.repository.EmployeeStoreRepository;

import org.springframework.stereotype.Service;

@Service
public class EmployeeStoreService extends CrudService<EmployeeStore, Integer> {
    public EmployeeStoreService(EmployeeStoreRepository repository, ObjectMapper mapper) {
        super(repository, mapper, EmployeeStore.class);
    }
}
