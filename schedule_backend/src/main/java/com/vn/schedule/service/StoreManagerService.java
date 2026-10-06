package com.vn.schedule.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.schedule.domain.StoreManager;
import com.vn.schedule.repository.StoreManagerRepository;

import org.springframework.stereotype.Service;

@Service
public class StoreManagerService extends CrudService<StoreManager, Integer> {
    public StoreManagerService(StoreManagerRepository repository, ObjectMapper mapper) {
        super(repository, mapper, StoreManager.class);
    }
}
