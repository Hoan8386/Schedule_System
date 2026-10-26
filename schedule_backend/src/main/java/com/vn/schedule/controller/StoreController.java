package com.vn.schedule.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.vn.schedule.domain.Store;
import com.vn.schedule.dto.request.StoreRequest;
import com.vn.schedule.dto.response.StoreResponse;
import com.vn.schedule.repository.StoreRepository;
import com.vn.schedule.repository.AttachmentRepository;
import com.vn.schedule.service.R2StorageService;

import java.util.Base64;
import java.util.List;
import com.vn.schedule.util.anotation.ApiMessage;

@RestController
@RequestMapping("/api/v1/stores")
public class StoreController {
    /** Trạng thái cửa hàng: OPENING (đang hoạt động) / CLOSED (đã đóng). */
    public static final String OPENING = "OPENING";
    public static final String CLOSED = "CLOSED";
    private static final java.util.Set<String> STATUSES = java.util.Set.of(OPENING, CLOSED);

    private final StoreRepository stores;
    private final AttachmentRepository attachments;
    private final R2StorageService storage;

    private final com.vn.schedule.service.StoreScopeService storeScopeService;
    private final com.vn.schedule.service.EmployeeAssignmentService assignmentService;

    public StoreController(StoreRepository stores, AttachmentRepository attachments, R2StorageService storage,
                           com.vn.schedule.service.StoreScopeService storeScopeService,
                           com.vn.schedule.service.EmployeeAssignmentService assignmentService) {
        this.storeScopeService = storeScopeService;
        this.assignmentService = assignmentService;
        this.stores = stores;
        this.attachments = attachments;
        this.storage = storage;
    }

    @GetMapping
    @ApiMessage("Lấy dữ liệu")
    public ResponseEntity<List<StoreResponse>> list(@RequestParam(required = false) String status,
                                                    @RequestParam(defaultValue = "true") boolean includeLogo) {
        // Lọc theo trạng thái đã chuẩn hóa (dữ liệu cũ ACTIVE / INACTIVE vẫn khớp OPENING / CLOSED)
        String wanted = status == null || status.isBlank() ? null : normalizeStatus(status);
        // Trưởng cửa hàng / nhân viên chỉ thấy cửa hàng của mình (lọc ngay tại DB)
        java.util.Set<Integer> visible = storeScopeService.visibleStoreIds();
        List<Store> scoped = visible == null ? stores.findAll() : visible.isEmpty() ? List.of() : stores.findAllById(visible);
        // includeLogo=false: bỏ tải ảnh từ R2 + base64 (vài trăm KB / cửa hàng) cho các màn hình chỉ cần id / tên
        return ResponseEntity.ok(scoped.stream()
                .filter(store -> wanted == null || wanted.equals(normalizeStatus(store.getStatus())))
                .sorted(java.util.Comparator.comparing(Store::getStoreName, java.util.Comparator.nullsLast(String::compareTo)))
                .map(store -> response(store, includeLogo))
                .toList());
    }

    @GetMapping("/{id}")
    @ApiMessage("Lấy thông tin chi tiết")
    public ResponseEntity<StoreResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(stores.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Store not found"))));
    }

    @PostMapping

    @ApiMessage("Tạo mới dữ liệu")
    public ResponseEntity<StoreResponse> create(@Valid @RequestBody StoreRequest request) {
        Store store = new Store();
        apply(store, request);
        store.setId(null);
        // Tạo mới luôn ở trạng thái OPENING, chỉ chọn trạng thái khi chỉnh sửa
        store.setStatus(OPENING);
        return ResponseEntity.status(HttpStatus.CREATED).body(response(stores.save(store)));
    }

    @PutMapping("/{id}")
    @ApiMessage("Cập nhật dữ liệu")
    public ResponseEntity<StoreResponse> update(@PathVariable Integer id, @Valid @RequestBody StoreRequest request) {
        Store store = stores.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Store not found"));
        apply(store, request);
        String status = request.status() == null ? null : request.status().trim().toUpperCase();
        if (status != null && !STATUSES.contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trạng thái cửa hàng chỉ là OPENING hoặc CLOSED");
        }
        store.setStatus(status != null ? status : normalizeStatus(store.getStatus()));
        return ResponseEntity.ok(response(stores.save(store)));
    }

    private void apply(Store store, StoreRequest request) {
        store.setStoreCode(request.storeCode());
        store.setStoreName(request.storeName());
        store.setStoreImageId(request.storeImageId());
        store.setAddress(request.address());
        store.setPhone(request.phone());
        store.setStatus(request.status());
        store.setNote(request.note());
    }

    /** Đổi trưởng cửa hàng, thêm / bỏ / chuyển cửa hàng và đổi vị trí nhân viên của cửa hàng trong một giao dịch. */
    @PutMapping("/{id}/staff")
    @ApiMessage("Cập nhật nhân sự cửa hàng")
    public ResponseEntity<Void> updateStaff(@PathVariable Integer id,
                                            @RequestBody com.vn.schedule.dto.request.StoreStaffRequest request) {
        assignmentService.updateStoreStaff(id, request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")

    @ApiMessage("Xóa dữ liệu")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        // Không cho xóa cửa hàng – chuyển sang CLOSED nếu ngừng hoạt động
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Không thể xóa cửa hàng – hãy chuyển trạng thái sang CLOSED nếu cửa hàng ngừng hoạt động");
    }

    /** Dữ liệu cũ: ACTIVE → OPENING, INACTIVE → CLOSED. */
    private static String normalizeStatus(String status) {
        String value = status == null ? OPENING : status.trim().toUpperCase();
        return switch (value) {
            case "ACTIVE" -> OPENING;
            case "INACTIVE" -> CLOSED;
            default -> STATUSES.contains(value) ? value : OPENING;
        };
    }

    private StoreResponse response(Object value) {
        return response((Store) value, true);
    }

    private StoreResponse response(Store store, boolean includeLogo) {
        StoreResponse response = new StoreResponse();
        response.setId(store.getId());
        response.setStoreCode(store.getStoreCode());
        response.setStoreName(store.getStoreName());
        response.setAddress(store.getAddress());
        response.setPhone(store.getPhone());
        response.setStatus(normalizeStatus(store.getStatus()));
        response.setNote(store.getNote());
        response.setCreatedAt(store.getCreatedAt());
        response.setUpdatedAt(store.getUpdatedAt());
        response.setStoreImageId(store.getStoreImageId());

        if (includeLogo && store.getStoreImageId() != null) {
            attachments.findById(store.getStoreImageId()).ifPresent(attachment -> {
                byte[] image = storage.download(attachment.getFilePath());
                response.setLogoContentType(attachment.getFileType());
                response.setLogoImage("data:" + attachment.getFileType() + ";base64,"
                        + Base64.getEncoder().encodeToString(image));
            });
        }
        return response;
    }
}
