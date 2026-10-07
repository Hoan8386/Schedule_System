package com.vn.schedule.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;

import com.vn.schedule.domain.Store;
import com.vn.schedule.dto.*;
import com.vn.schedule.repository.StoreRepository;
import com.vn.schedule.service.AttachmentService;

import java.util.List;
import com.vn.schedule.util.anotation.ApiMessage;

@RestController
@RequestMapping("/api/v1/stores")
public class StoreController {
    private final StoreRepository stores;
    private final AttachmentService attachments;

    public StoreController(StoreRepository stores, AttachmentService attachments) {
        this.stores = stores;
        this.attachments = attachments;
    }

    @GetMapping
    @ApiMessage("Lấy dữ liệu")
    public ResponseEntity<List<StoreResponse>> list(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(responses(status == null ? stores.findAll() : stores.findByStatusOrderByStoreName(status)));
    }

    @GetMapping("/{id}")
    @ApiMessage("Lấy thông tin chi tiết")
    public ResponseEntity<StoreResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(stores.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Store not found"))));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)

    @ApiMessage("Tạo mới dữ liệu")
    public ResponseEntity<StoreResponse> create(
            @RequestParam String storeCode,
            @RequestParam String storeName,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) String phone,
            @RequestParam String status,
            @RequestParam(required = false) String note,
            @RequestPart("logo") MultipartFile logo) {
        StoreRequest request = new StoreRequest(storeCode, storeName, address, phone, status, note);
        Store store = new Store();
        apply(store, request);
        store.setLogoId(attachments.uploadImage(logo, null).getAttachmentId());
        store.setId(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(response(stores.save(store)));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ApiMessage("Cập nhật dữ liệu")
    public ResponseEntity<StoreResponse> update(
            @PathVariable Integer id,
            @RequestParam String storeCode,
            @RequestParam String storeName,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) String phone,
            @RequestParam String status,
            @RequestParam(required = false) String note,
            @RequestPart("logo") MultipartFile logo) {
        StoreRequest request = new StoreRequest(storeCode, storeName, address, phone, status, note);
        Store store = stores.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Store not found"));
        apply(store, request);
        store.setLogoId(attachments.uploadImage(logo, null).getAttachmentId());
        return ResponseEntity.ok(response(stores.save(store)));
    }

    private void apply(Store store, StoreRequest request) {
        store.setStoreCode(request.storeCode());
        store.setStoreName(request.storeName());
        store.setAddress(request.address());
        store.setPhone(request.phone());
        store.setStatus(request.status());
        store.setNote(request.note());
    }

    @DeleteMapping("/{id}")

    @ApiMessage("Xóa dữ liệu")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        stores.delete(stores.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Store not found")));
        return ResponseEntity.noContent().build();
    }

    private List<StoreResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(StoreResponse::new).toList();
    }

    private StoreResponse response(Object value) {
        return new StoreResponse(DtoMapper.toMap(value));
    }
}
