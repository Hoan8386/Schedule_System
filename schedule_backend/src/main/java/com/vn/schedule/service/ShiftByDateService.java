package com.vn.schedule.service;

import com.vn.schedule.domain.ShiftByDate;
import com.vn.schedule.domain.SchedulePeriod;
import com.vn.schedule.domain.Shift;
import com.vn.schedule.repository.ShiftByDateRepository;
import com.vn.schedule.repository.SchedulePeriodRepository;
import com.vn.schedule.repository.ShiftRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.ShiftByDateRequest;
import java.time.LocalTime;
import java.time.LocalDate;
import java.math.BigDecimal;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ShiftByDateService {
    private final ShiftByDateRepository repository;
    private final ShiftRepository shiftRepository;
    private final SchedulePeriodRepository schedulePeriodRepository;

    public ShiftByDateService(ShiftByDateRepository repository, ShiftRepository shiftRepository,
                              SchedulePeriodRepository schedulePeriodRepository) {
        this.repository = repository;
        this.shiftRepository = shiftRepository;
        this.schedulePeriodRepository = schedulePeriodRepository;
    }

    public List<ShiftByDate> findAll() {
        return repository.findAll();
    }

    public ShiftByDate findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public ShiftByDate create(ShiftByDateRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public ShiftByDate update(Integer id, ShiftByDateRequest body) {
        ShiftByDate current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public ShiftByDate save(ShiftByDateRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(ShiftByDateRequest body) {
        repository.delete(toEntity(body));
    }
    private ShiftByDate toEntity(ShiftByDateRequest body) {
        ShiftByDate entity = new ShiftByDate();
        entity.setId((Integer) body.get("id"));
        entity.setShift(resolveShift(body));
        entity.setSchedulePeriod(resolveSchedulePeriod(body));
        entity.setWorkDate((LocalDate) body.get("workDate"));
        entity.setCapacity((Integer) body.get("capacity"));
        entity.setShiftName((String) body.get("shiftName"));
        entity.setStartTime((LocalTime) body.get("startTime"));
        entity.setEndTime((LocalTime) body.get("endTime"));
        entity.setMaxCapacity((Integer) body.get("maxCapacity"));
        entity.setPayRate((BigDecimal) body.get("payRate"));
        entity.setStatus((String) body.get("status"));
        entity.setManagerNote((String) body.get("managerNote"));
        return entity;
    }

    private void applyFields(ShiftByDate entity, ShiftByDateRequest body) {
        entity.setId((Integer) body.get("id"));
        entity.setShift(resolveShift(body));
        entity.setSchedulePeriod(resolveSchedulePeriod(body));
        entity.setWorkDate((LocalDate) body.get("workDate"));
        entity.setCapacity((Integer) body.get("capacity"));
        entity.setShiftName((String) body.get("shiftName"));
        entity.setStartTime((LocalTime) body.get("startTime"));
        entity.setEndTime((LocalTime) body.get("endTime"));
        entity.setMaxCapacity((Integer) body.get("maxCapacity"));
        entity.setPayRate((BigDecimal) body.get("payRate"));
        entity.setStatus((String) body.get("status"));
        entity.setManagerNote((String) body.get("managerNote"));
    }

    private Shift resolveShift(ShiftByDateRequest body) {
        return shiftRepository.getReferenceById(requiredId(body.get("shift"), "shift"));
    }

    private SchedulePeriod resolveSchedulePeriod(ShiftByDateRequest body) {
        Object value = body.get("schedulePeriod");
        return value == null ? null
                : schedulePeriodRepository.getReferenceById(requiredId(value, "schedulePeriod"));
    }

    private Integer requiredId(Object value, String fieldName) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        if (value instanceof java.util.Map<?, ?> map && map.get("id") instanceof Number number) {
            return number.intValue();
        }
        throw new ApiException(HttpStatus.BAD_REQUEST, fieldName + " is required");
    }
}
