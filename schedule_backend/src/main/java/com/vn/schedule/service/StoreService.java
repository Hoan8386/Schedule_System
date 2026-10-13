package com.vn.schedule.service;

import com.vn.schedule.domain.Store;
import com.vn.schedule.repository.StoreRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.request.StoreRequest;
import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StoreService {
    private final StoreRepository repository;
    private final StoreScopeService storeScopeService;
    public StoreService(StoreRepository repository, StoreScopeService storeScopeService) {
        this.repository = repository;
        this.storeScopeService = storeScopeService;
    }

    public List<Store> findAll() {
        return repository.findAll().stream()
                .filter(store -> storeScopeService.isGlobalUser()
                        || storeScopeService.canAccessStore(store.getId()))
                .toList();
    }

    public Store findById(Integer id) {
        Store store = repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
        storeScopeService.requireStoreAccess(store.getId());
        return store;
    }

    @Transactional
    public Store create(StoreRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public Store update(Integer id, StoreRequest body) {
        Store current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public Store save(StoreRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(StoreRequest body) {
        repository.delete(toEntity(body));
    }
    private Store toEntity(StoreRequest body) {
        Store entity = new Store();
        entity.setStoreCode(body.storeCode());
        entity.setStoreName(body.storeName());
        entity.setStoreImageId(body.storeImageId());
        entity.setAddress(body.address());
        entity.setPhone(body.phone());
        entity.setStatus(body.status());
        entity.setNote(body.note());
        return entity;
    }

    private void applyFields(Store entity, StoreRequest body) {
        entity.setStoreCode(body.storeCode());
        entity.setStoreName(body.storeName());
        entity.setStoreImageId(body.storeImageId());
        entity.setAddress(body.address());
        entity.setPhone(body.phone());
        entity.setStatus(body.status());
        entity.setNote(body.note());
    }
}
