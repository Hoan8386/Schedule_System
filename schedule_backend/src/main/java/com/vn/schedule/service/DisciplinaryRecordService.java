package com.vn.schedule.service;

import com.vn.schedule.domain.DisciplinaryRecord;
import com.vn.schedule.repository.DisciplinaryRecordRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.request.DisciplinaryRecordRequest;
import java.time.LocalDateTime;
import java.math.BigDecimal;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DisciplinaryRecordService {
    private final DisciplinaryRecordRepository repository;
    private final StoreScopeService storeScopeService;
    public DisciplinaryRecordService(DisciplinaryRecordRepository repository,
                                     StoreScopeService storeScopeService) {
        this.repository = repository;
        this.storeScopeService = storeScopeService;
    }

    public List<DisciplinaryRecord> findAll() {
        // Mới nhất trước
        return repository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Order.desc("createdAt"), org.springframework.data.domain.Sort.Order.desc("disciplinaryId"))).stream()
                .filter(item -> storeScopeService.isGlobalUser()
                        || storeScopeService.canAccessStore(item.getStoreId()))
                .toList();
    }

    public DisciplinaryRecord findById(Integer id) {
        DisciplinaryRecord item = repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
        storeScopeService.requireStoreAccess(item.getStoreId());
        return item;
    }

    @Transactional
    public DisciplinaryRecord create(DisciplinaryRecordRequest body) {
        DisciplinaryRecord item = toEntity(body);
        storeScopeService.requireStoreAccess(item.getStoreId());
        return repository.save(item);
    }

    @Transactional
    public DisciplinaryRecord update(Integer id, DisciplinaryRecordRequest body) {
        DisciplinaryRecord current = findById(id);
        applyFields(current, body);
        storeScopeService.requireStoreAccess(current.getStoreId());
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public DisciplinaryRecord save(DisciplinaryRecordRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(DisciplinaryRecordRequest body) {
        repository.delete(toEntity(body));
    }
    private DisciplinaryRecord toEntity(DisciplinaryRecordRequest body) {
        DisciplinaryRecord entity = new DisciplinaryRecord();
        entity.setDisciplinaryId((Integer) body.get("disciplinaryId"));
        entity.setStoreId((Integer) body.get("storeId"));
        entity.setEmployeeId((Integer) body.get("employeeId"));
        entity.setDisciplinaryType((String) body.get("disciplinaryType"));
        entity.setAmount((BigDecimal) body.get("amount"));
        entity.setReason((String) body.get("reason"));
        entity.setStatus((String) body.get("status"));
        entity.setCreatedBy((Integer) body.get("createdBy"));
        entity.setApprovedBy((Integer) body.get("approvedBy"));
        entity.setApprovedAt((LocalDateTime) body.get("approvedAt"));
        return entity;
    }

    private void applyFields(DisciplinaryRecord entity, DisciplinaryRecordRequest body) {
        entity.setDisciplinaryId((Integer) body.get("disciplinaryId"));
        entity.setStoreId((Integer) body.get("storeId"));
        entity.setEmployeeId((Integer) body.get("employeeId"));
        entity.setDisciplinaryType((String) body.get("disciplinaryType"));
        entity.setAmount((BigDecimal) body.get("amount"));
        entity.setReason((String) body.get("reason"));
        entity.setStatus((String) body.get("status"));
        entity.setCreatedBy((Integer) body.get("createdBy"));
        entity.setApprovedBy((Integer) body.get("approvedBy"));
        entity.setApprovedAt((LocalDateTime) body.get("approvedAt"));
    }
}
