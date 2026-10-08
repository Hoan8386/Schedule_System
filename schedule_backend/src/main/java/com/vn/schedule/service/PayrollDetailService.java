package com.vn.schedule.service;

import com.vn.schedule.domain.PayrollDetail;
import com.vn.schedule.repository.PayrollDetailRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.request.PayrollDetailRequest;
import java.time.LocalDateTime;
import java.math.BigDecimal;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PayrollDetailService {
    private final PayrollDetailRepository repository;
    public PayrollDetailService(PayrollDetailRepository repository) {
        this.repository = repository;
    }

    public List<PayrollDetail> findAll() {
        return repository.findAll();
    }

    public PayrollDetail findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public PayrollDetail create(PayrollDetailRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public PayrollDetail update(Integer id, PayrollDetailRequest body) {
        PayrollDetail current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public PayrollDetail save(PayrollDetailRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(PayrollDetailRequest body) {
        repository.delete(toEntity(body));
    }
    private PayrollDetail toEntity(PayrollDetailRequest body) {
        PayrollDetail entity = new PayrollDetail();
        entity.setPayrollDetailId((Integer) body.get("payrollDetailId"));
        entity.setPayrollId((Integer) body.get("payrollId"));
        entity.setShiftByDateId((Integer) body.get("shiftByDateId"));
        entity.setAttendanceId((Integer) body.get("attendanceId"));
        entity.setBonusRecordId((Integer) body.get("bonusRecordId"));
        entity.setViolationId((Integer) body.get("violationId"));
        entity.setItemType((String) body.get("itemType"));
        entity.setDescription((String) body.get("description"));
        entity.setAmount((BigDecimal) body.get("amount"));
        return entity;
    }

    private void applyFields(PayrollDetail entity, PayrollDetailRequest body) {
        entity.setPayrollDetailId((Integer) body.get("payrollDetailId"));
        entity.setPayrollId((Integer) body.get("payrollId"));
        entity.setShiftByDateId((Integer) body.get("shiftByDateId"));
        entity.setAttendanceId((Integer) body.get("attendanceId"));
        entity.setBonusRecordId((Integer) body.get("bonusRecordId"));
        entity.setViolationId((Integer) body.get("violationId"));
        entity.setItemType((String) body.get("itemType"));
        entity.setDescription((String) body.get("description"));
        entity.setAmount((BigDecimal) body.get("amount"));
    }
}
