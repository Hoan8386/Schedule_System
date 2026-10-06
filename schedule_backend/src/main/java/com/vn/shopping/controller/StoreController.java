package com.vn.shopping.controller;

import com.vn.shopping.domain.Store;
import com.vn.shopping.dto.DtoMapper;
import com.vn.shopping.dto.StoreRequest;
import com.vn.shopping.repository.StoreRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/stores")
public class StoreController {
    private final StoreRepository stores;

    public StoreController(StoreRepository stores) {
        this.stores = stores;
    }

    @GetMapping
    public List<Map<String, Object>> list(@RequestParam(required = false) String status) {
        return DtoMapper.toList(status == null ? stores.findAll() : stores.findByStatusOrderByStoreName(status));
    }

    @GetMapping("/{id}")
    public Map<String, Object> get(@PathVariable Integer id) {
        return DtoMapper.toMap(stores.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Store not found")));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> create(@Valid @RequestBody StoreRequest request) {
        Store store = new Store();
        apply(store, request);
        store.setId(null);
        return DtoMapper.toMap(stores.save(store));
    }

    @PutMapping("/{id}")
    public Map<String, Object> update(@PathVariable Integer id, @Valid @RequestBody StoreRequest request) {
        Store store = stores.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Store not found"));
        apply(store, request);
        return DtoMapper.toMap(stores.save(store));
    }

    private void apply(Store store, StoreRequest request) {
        store.setStoreCode(request.storeCode());
        store.setStoreName(request.storeName());
        store.setLogoId(request.logoId());
        store.setAddress(request.address());
        store.setPhone(request.phone());
        store.setStatus(request.status());
        store.setNote(request.note());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        stores.delete(stores.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Store not found")));
    }
}
