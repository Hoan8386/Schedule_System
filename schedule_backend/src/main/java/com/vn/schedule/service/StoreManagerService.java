package com.vn.schedule.service;

import com.vn.schedule.domain.StoreManager;
import com.vn.schedule.dto.request.StoreManagerRequest;
import com.vn.schedule.repository.StoreManagerRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.util.SecurityUtil;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StoreManagerService {
    private final StoreManagerRepository repository;
    private final StoreScopeService storeScopeService;

    public StoreManagerService(StoreManagerRepository repository, StoreScopeService storeScopeService) {
        this.repository = repository;
        this.storeScopeService = storeScopeService;
    }

    public List<StoreManager> findAll() {
        Set<Integer> visibleStoreIds = visibleStoreIds();
        if (visibleStoreIds == null) {
            return repository.findAll();
        }
        return visibleStoreIds.isEmpty() ? List.of() : repository.findByStoreIdInOrderByStoreManagerId(visibleStoreIds);
    }

    public StoreManager findById(Integer id) {
        StoreManager item = repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));

        Set<Integer> visibleStoreIds = visibleStoreIds();
        if (visibleStoreIds != null && !visibleStoreIds.contains(item.getStoreId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem dữ liệu cửa hàng này");
        }

        return item;
    }

    @Transactional
    public StoreManager create(StoreManagerRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public StoreManager update(Integer id, StoreManagerRequest body) {
        StoreManager current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public StoreManager save(StoreManagerRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(StoreManagerRequest body) {
        repository.delete(toEntity(body));
    }

    private Set<Integer> visibleStoreIds() {
        if (SecurityUtil.getCurrentUserLogin().isEmpty()) {
            return Set.of();
        }
        return storeScopeService.visibleStoreIds();
    }

    private StoreManager toEntity(StoreManagerRequest body) {
        StoreManager entity = new StoreManager();
        entity.setStoreManagerId((Integer) body.get("storeManagerId"));
        entity.setStoreId((Integer) body.get("storeId"));
        entity.setEmployeeId((Integer) body.get("employeeId"));
        entity.setStartDate((LocalDate) body.get("startDate"));
        entity.setEndDate((LocalDate) body.get("endDate"));
        entity.setStatus((String) body.get("status"));
        entity.setAssignedBy((Integer) body.get("assignedBy"));
        entity.setNote((String) body.get("note"));
        return entity;
    }

    private void applyFields(StoreManager entity, StoreManagerRequest body) {
        entity.setStoreManagerId((Integer) body.get("storeManagerId"));
        entity.setStoreId((Integer) body.get("storeId"));
        entity.setEmployeeId((Integer) body.get("employeeId"));
        entity.setStartDate((LocalDate) body.get("startDate"));
        entity.setEndDate((LocalDate) body.get("endDate"));
        entity.setStatus((String) body.get("status"));
        entity.setAssignedBy((Integer) body.get("assignedBy"));
        entity.setNote((String) body.get("note"));
    }
}
