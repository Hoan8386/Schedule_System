package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.Store;
import com.vn.shopping.repository.StoreRepository;
import org.springframework.stereotype.Service;

@Service
public class StoreService extends CrudService<Store, Integer> {
    public StoreService(StoreRepository repository, ObjectMapper mapper) {
        super(repository, mapper, Store.class);
    }
}
