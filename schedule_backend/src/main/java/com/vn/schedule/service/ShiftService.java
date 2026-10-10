package com.vn.schedule.service;

import com.vn.schedule.domain.Shift;
import com.vn.schedule.domain.Store;
import com.vn.schedule.repository.ShiftRepository;
import com.vn.schedule.repository.StoreRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.request.ShiftRequest;
import java.math.BigDecimal;
import java.time.LocalTime;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ShiftService {
    private final ShiftRepository repository;
    private final StoreRepository storeRepository;

    public ShiftService(ShiftRepository repository, StoreRepository storeRepository) {
        this.repository = repository;
        this.storeRepository = storeRepository;
    }

    @Transactional(readOnly = true)
    public List<Shift> findAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Shift> findAll(Integer storeId, String status) {
        return repository.findAll().stream()
                .filter(shift -> storeId == null || shift.getStore().getId().equals(storeId))
                .filter(shift -> status == null || status.isBlank() || status.equalsIgnoreCase(shift.getStatus()))
                .toList();
    }

    public Shift findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public Shift create(ShiftRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public Shift update(Integer id, ShiftRequest body) {
        Shift current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public Shift save(ShiftRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(ShiftRequest body) {
        repository.delete(toEntity(body));
    }
    private Shift toEntity(ShiftRequest body) {
        Shift entity = new Shift();
        entity.setId(integerValue(body.get("id"), "id"));
        entity.setStore(resolveStore(body));
        entity.setShiftCode((String) body.get("shiftCode"));
        entity.setShiftName((String) body.get("shiftName"));
        entity.setStartTime(timeValue(body.get("startTime"), "startTime"));
        entity.setEndTime(timeValue(body.get("endTime"), "endTime"));
        entity.setMaxCapacity(integerValue(body.get("maxCapacity"), "maxCapacity"));
        entity.setPayRate(decimalValue(body.get("payRate"), "payRate"));
        entity.setStatus((String) body.get("status"));
        entity.setNote((String) body.get("note"));
        entity.setCreatedBy(integerValue(body.get("createdBy"), "createdBy"));
        return entity;
    }

    private void applyFields(Shift entity, ShiftRequest body) {
        entity.setId(integerValue(body.get("id"), "id"));
        entity.setStore(resolveStore(body));
        entity.setShiftCode((String) body.get("shiftCode"));
        entity.setShiftName((String) body.get("shiftName"));
        entity.setStartTime(timeValue(body.get("startTime"), "startTime"));
        entity.setEndTime(timeValue(body.get("endTime"), "endTime"));
        entity.setMaxCapacity(integerValue(body.get("maxCapacity"), "maxCapacity"));
        entity.setPayRate(decimalValue(body.get("payRate"), "payRate"));
        entity.setStatus((String) body.get("status"));
        entity.setNote((String) body.get("note"));
        entity.setCreatedBy(integerValue(body.get("createdBy"), "createdBy"));
    }

    private Store resolveStore(ShiftRequest body) {
        return storeRepository.getReferenceById(requiredId(body.get("store"), "store"));
    }

    private Integer requiredId(Object value, String fieldName) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        if (value instanceof String string && !string.isBlank()) {
            return parseInteger(string, fieldName);
        }
        if (value instanceof java.util.Map<?, ?> map) {
            return requiredId(map.get("id"), fieldName);
        }
        throw new ApiException(HttpStatus.BAD_REQUEST, fieldName + " is required");
    }

    private Integer integerValue(Object value, String fieldName) {
        if (value == null || (value instanceof String string && string.isBlank())) {
            return null;
        }
        if (value instanceof Number number) {
            return number.intValue();
        }
        if (value instanceof String string) {
            return parseInteger(string, fieldName);
        }
        throw invalidValue(fieldName, "số nguyên");
    }

    private Integer parseInteger(String value, String fieldName) {
        try {
            return Integer.valueOf(value.trim());
        } catch (NumberFormatException exception) {
            throw invalidValue(fieldName, "số nguyên");
        }
    }

    private LocalTime timeValue(Object value, String fieldName) {
        if (value == null || (value instanceof String string && string.isBlank())) {
            return null;
        }
        if (value instanceof LocalTime time) {
            return time;
        }
        if (value instanceof String string) {
            try {
                return LocalTime.parse(string.trim());
            } catch (java.time.format.DateTimeParseException exception) {
                throw invalidValue(fieldName, "giờ hợp lệ theo định dạng HH:mm hoặc HH:mm:ss");
            }
        }
        throw invalidValue(fieldName, "giờ hợp lệ theo định dạng HH:mm hoặc HH:mm:ss");
    }

    private BigDecimal decimalValue(Object value, String fieldName) {
        if (value == null || (value instanceof String string && string.isBlank())) {
            return null;
        }
        if (value instanceof BigDecimal decimal) {
            return decimal;
        }
        if (value instanceof Number number) {
            return new BigDecimal(number.toString());
        }
        if (value instanceof String string) {
            try {
                return new BigDecimal(string.trim());
            } catch (NumberFormatException exception) {
                throw invalidValue(fieldName, "số thập phân");
            }
        }
        throw invalidValue(fieldName, "số thập phân");
    }

    private ApiException invalidValue(String fieldName, String expected) {
        return new ApiException(HttpStatus.BAD_REQUEST, fieldName + " phải là " + expected);
    }
}
