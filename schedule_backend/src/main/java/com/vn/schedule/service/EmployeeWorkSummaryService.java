package com.vn.schedule.service;

import com.vn.schedule.domain.EmployeeWorkSummary;
import com.vn.schedule.repository.EmployeeWorkSummaryRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.EmployeeWorkSummaryRequest;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.math.BigDecimal;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EmployeeWorkSummaryService {
    private final EmployeeWorkSummaryRepository repository;
    public EmployeeWorkSummaryService(EmployeeWorkSummaryRepository repository) {
        this.repository = repository;
    }

    public List<EmployeeWorkSummary> findAll() {
        return repository.findAll();
    }

    public EmployeeWorkSummary findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public EmployeeWorkSummary create(EmployeeWorkSummaryRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public EmployeeWorkSummary update(Integer id, EmployeeWorkSummaryRequest body) {
        EmployeeWorkSummary current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public EmployeeWorkSummary save(EmployeeWorkSummaryRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(EmployeeWorkSummaryRequest body) {
        repository.delete(toEntity(body));
    }
    private EmployeeWorkSummary toEntity(EmployeeWorkSummaryRequest body) {
        EmployeeWorkSummary entity = new EmployeeWorkSummary();
        entity.setSummaryId((Integer) body.get("summaryId"));
        entity.setEmployeeId((Integer) body.get("employeeId"));
        entity.setStoreId((Integer) body.get("storeId"));
        entity.setPeriodStart((LocalDate) body.get("periodStart"));
        entity.setPeriodEnd((LocalDate) body.get("periodEnd"));
        entity.setTotalShifts((Integer) body.get("totalShifts"));
        entity.setTotalWorkedHours((BigDecimal) body.get("totalWorkedHours"));
        entity.setTotalScheduledHours((BigDecimal) body.get("totalScheduledHours"));
        entity.setAverageHoursPerShift((BigDecimal) body.get("averageHoursPerShift"));
        entity.setTotalLateMinutes((Integer) body.get("totalLateMinutes"));
        entity.setTotalEarlyLeaveMinutes((Integer) body.get("totalEarlyLeaveMinutes"));
        entity.setAttendanceRate((BigDecimal) body.get("attendanceRate"));
        entity.setTargetValue((BigDecimal) body.get("targetValue"));
        entity.setActualValue((BigDecimal) body.get("actualValue"));
        entity.setExceededValue((BigDecimal) body.get("exceededValue"));
        entity.setEvaluationScore((BigDecimal) body.get("evaluationScore"));
        entity.setCalculatedAt((LocalDateTime) body.get("calculatedAt"));
        return entity;
    }

    private void applyFields(EmployeeWorkSummary entity, EmployeeWorkSummaryRequest body) {
        entity.setSummaryId((Integer) body.get("summaryId"));
        entity.setEmployeeId((Integer) body.get("employeeId"));
        entity.setStoreId((Integer) body.get("storeId"));
        entity.setPeriodStart((LocalDate) body.get("periodStart"));
        entity.setPeriodEnd((LocalDate) body.get("periodEnd"));
        entity.setTotalShifts((Integer) body.get("totalShifts"));
        entity.setTotalWorkedHours((BigDecimal) body.get("totalWorkedHours"));
        entity.setTotalScheduledHours((BigDecimal) body.get("totalScheduledHours"));
        entity.setAverageHoursPerShift((BigDecimal) body.get("averageHoursPerShift"));
        entity.setTotalLateMinutes((Integer) body.get("totalLateMinutes"));
        entity.setTotalEarlyLeaveMinutes((Integer) body.get("totalEarlyLeaveMinutes"));
        entity.setAttendanceRate((BigDecimal) body.get("attendanceRate"));
        entity.setTargetValue((BigDecimal) body.get("targetValue"));
        entity.setActualValue((BigDecimal) body.get("actualValue"));
        entity.setExceededValue((BigDecimal) body.get("exceededValue"));
        entity.setEvaluationScore((BigDecimal) body.get("evaluationScore"));
        entity.setCalculatedAt((LocalDateTime) body.get("calculatedAt"));
    }
}
