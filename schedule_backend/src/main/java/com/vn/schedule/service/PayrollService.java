package com.vn.schedule.service;

import com.vn.schedule.domain.Payroll;
import com.vn.schedule.repository.PayrollRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.request.PayrollRequest;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.math.BigDecimal;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PayrollService {
    private final PayrollRepository repository;
    public PayrollService(PayrollRepository repository) {
        this.repository = repository;
    }

    public List<Payroll> findAll() {
        return repository.findAll();
    }

    public Payroll findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public Payroll create(PayrollRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public Payroll update(Integer id, PayrollRequest body) {
        Payroll current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public Payroll save(PayrollRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(PayrollRequest body) {
        repository.delete(toEntity(body));
    }
    private Payroll toEntity(PayrollRequest body) {
        Payroll entity = new Payroll();
        entity.setPayrollId((Integer) body.get("payrollId"));
        entity.setEmployeeId((Integer) body.get("employeeId"));
        entity.setStoreId((Integer) body.get("storeId"));
        entity.setPayrollMonth((LocalDate) body.get("payrollMonth"));
        entity.setBaseAmount((BigDecimal) body.get("baseAmount"));
        entity.setBonusAmount((BigDecimal) body.get("bonusAmount"));
        entity.setPenaltyAmount((BigDecimal) body.get("penaltyAmount"));
        entity.setTotalAmount((BigDecimal) body.get("totalAmount"));
        entity.setStatus((String) body.get("status"));
        entity.setCreatedBy((Integer) body.get("createdBy"));
        entity.setApprovedBy((Integer) body.get("approvedBy"));
        entity.setApprovedAt((LocalDateTime) body.get("approvedAt"));
        return entity;
    }

    private void applyFields(Payroll entity, PayrollRequest body) {
        entity.setPayrollId((Integer) body.get("payrollId"));
        entity.setEmployeeId((Integer) body.get("employeeId"));
        entity.setStoreId((Integer) body.get("storeId"));
        entity.setPayrollMonth((LocalDate) body.get("payrollMonth"));
        entity.setBaseAmount((BigDecimal) body.get("baseAmount"));
        entity.setBonusAmount((BigDecimal) body.get("bonusAmount"));
        entity.setPenaltyAmount((BigDecimal) body.get("penaltyAmount"));
        entity.setTotalAmount((BigDecimal) body.get("totalAmount"));
        entity.setStatus((String) body.get("status"));
        entity.setCreatedBy((Integer) body.get("createdBy"));
        entity.setApprovedBy((Integer) body.get("approvedBy"));
        entity.setApprovedAt((LocalDateTime) body.get("approvedAt"));
    }
}
