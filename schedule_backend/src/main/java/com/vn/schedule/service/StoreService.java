package com.vn.schedule.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.schedule.domain.Store;
import com.vn.schedule.repository.StoreRepository;

import org.springframework.stereotype.Service;

@Service
public class StoreService extends CrudService<Store, Integer> {
    public StoreService(StoreRepository repository, ObjectMapper mapper) {
        super(repository, mapper, Store.class);
    }
}
