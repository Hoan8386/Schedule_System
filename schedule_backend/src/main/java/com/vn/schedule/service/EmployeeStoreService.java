package com.vn.schedule.service;

import com.vn.schedule.domain.EmployeeStore;
import com.vn.schedule.repository.EmployeeStoreRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.request.EmployeeStoreRequest;
import java.time.LocalDate;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
public class EmployeeStoreService {
    private final EmployeeStoreRepository repository;
    private final StoreScopeService storeScopeService;

    public EmployeeStoreService(
            EmployeeStoreRepository repository,
            StoreScopeService storeScopeService) {
        this.repository = repository;
        this.storeScopeService = storeScopeService;
    }

    public List<EmployeeStore> findAll() {
        return findByFilters(null, null, null, null);
    }

    public List<EmployeeStore> findByFilters(
            Integer storeId,
            String role,
            String status,
            Boolean primary) {
        String roleFilter = normalizeRole(role);
        if ("NONE".equals(roleFilter)) {
            return List.of();
        }
        // Lọc phạm vi cửa hàng, trạng thái, cửa hàng chính và vai trò (so với store_manager) ngay trong một truy vấn
        Set<Integer> visibleStoreIds = storeScopeService.visibleStoreIds();
        return repository.search(visibleStoreIds == null, StoreScopeService.inParam(visibleStoreIds),
                true, List.of(-1), storeId, status, primary, roleFilter);
    }

    /** ALL / rỗng = không lọc; STAFF = EMPLOYEE; giá trị khác MANAGER / EMPLOYEE không khớp bản ghi nào (NONE). */
    private static String normalizeRole(String role) {
        if (role == null || role.isBlank() || "ALL".equalsIgnoreCase(role)) {
            return null;
        }
        if ("MANAGER".equalsIgnoreCase(role)) {
            return "MANAGER";
        }
        if ("EMPLOYEE".equalsIgnoreCase(role) || "STAFF".equalsIgnoreCase(role)) {
            return "EMPLOYEE";
        }
        return "NONE";
    }

    public EmployeeStore findById(Integer id) {
        EmployeeStore item = repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
        storeScopeService.requireStoreAccess(item.getStoreId());
        return item;
    }

    @Transactional
    public EmployeeStore create(EmployeeStoreRequest body) {
        EmployeeStore entity = toEntity(body);
        storeScopeService.requireStoreAccess(entity.getStoreId());
        return repository.save(entity);
    }

    @Transactional
    public EmployeeStore update(Integer id, EmployeeStoreRequest body) {
        EmployeeStore current = findById(id);
        applyFields(current, body);
        storeScopeService.requireStoreAccess(current.getStoreId());
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public EmployeeStore save(EmployeeStoreRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(EmployeeStoreRequest body) {
        repository.delete(toEntity(body));
    }
    private EmployeeStore toEntity(EmployeeStoreRequest body) {
        EmployeeStore entity = new EmployeeStore();
        applyFields(entity, body);
        return entity;
    }

    private void applyFields(EmployeeStore entity, EmployeeStoreRequest body) {
        entity.setEmployeeId(integer(body.get("employeeId")));
        entity.setStoreId(integer(body.get("storeId")));
        entity.setStartDate(localDate(body.get("startDate")));
        entity.setEndDate(localDate(body.get("endDate")));
        entity.setIsPrimary((Boolean) body.get("isPrimary"));
        entity.setStatus((String) body.get("status"));
        entity.setAssignedBy(integer(body.get("assignedBy")));
    }

    private Integer integer(Object value) {
        return value instanceof Number number ? number.intValue() : null;
    }

    private LocalDate localDate(Object value) {
        return value instanceof LocalDate date
                ? date
                : value instanceof String text && !text.isBlank()
                        ? LocalDate.parse(text)
                        : null;
    }
}
