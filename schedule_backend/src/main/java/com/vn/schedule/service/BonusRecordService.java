package com.vn.schedule.service;

import com.vn.schedule.domain.BonusRecord;
import com.vn.schedule.repository.BonusRecordRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.request.BonusRecordRequest;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.math.BigDecimal;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BonusRecordService {
    private final BonusRecordRepository repository;
    public BonusRecordService(BonusRecordRepository repository) {
        this.repository = repository;
    }

    public List<BonusRecord> findAll() {
        return repository.findAll();
    }

    public BonusRecord findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public BonusRecord create(BonusRecordRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public BonusRecord update(Integer id, BonusRecordRequest body) {
        BonusRecord current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public BonusRecord save(BonusRecordRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(BonusRecordRequest body) {
        repository.delete(toEntity(body));
    }
    private BonusRecord toEntity(BonusRecordRequest body) {
        BonusRecord entity = new BonusRecord();
        entity.setBonusRecordId((Integer) body.get("bonusRecordId"));
        entity.setEmployeeId((Integer) body.get("employeeId"));
        entity.setPayrollMonth((LocalDate) body.get("payrollMonth"));
        entity.setTotalBonus((BigDecimal) body.get("totalBonus"));
        entity.setTotalPenalty((BigDecimal) body.get("totalPenalty"));
        entity.setTotalAmount((BigDecimal) body.get("totalAmount"));
        entity.setStatus((String) body.get("status"));
        entity.setCreatedBy((Integer) body.get("createdBy"));
        entity.setApprovedBy((Integer) body.get("approvedBy"));
        entity.setApprovedAt((LocalDateTime) body.get("approvedAt"));
        return entity;
    }

    private void applyFields(BonusRecord entity, BonusRecordRequest body) {
        entity.setBonusRecordId((Integer) body.get("bonusRecordId"));
        entity.setEmployeeId((Integer) body.get("employeeId"));
        entity.setPayrollMonth((LocalDate) body.get("payrollMonth"));
        entity.setTotalBonus((BigDecimal) body.get("totalBonus"));
        entity.setTotalPenalty((BigDecimal) body.get("totalPenalty"));
        entity.setTotalAmount((BigDecimal) body.get("totalAmount"));
        entity.setStatus((String) body.get("status"));
        entity.setCreatedBy((Integer) body.get("createdBy"));
        entity.setApprovedBy((Integer) body.get("approvedBy"));
        entity.setApprovedAt((LocalDateTime) body.get("approvedAt"));
    }
}
