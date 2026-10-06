package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.EmployeeStore;
import com.vn.shopping.repository.EmployeeStoreRepository;
import org.springframework.stereotype.Service;

@Service
public class EmployeeStoreService extends CrudService<EmployeeStore, Integer> {
    public EmployeeStoreService(EmployeeStoreRepository repository, ObjectMapper mapper) {
        super(repository, mapper, EmployeeStore.class);
    }
}
