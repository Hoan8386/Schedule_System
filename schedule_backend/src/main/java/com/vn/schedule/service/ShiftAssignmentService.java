package com.vn.schedule.service;

import com.vn.schedule.domain.ShiftAssignment;
import com.vn.schedule.domain.Employee;
import com.vn.schedule.domain.ShiftByDate;
import com.vn.schedule.repository.ShiftAssignmentRepository;
import com.vn.schedule.repository.EmployeeRepository;
import com.vn.schedule.repository.ShiftByDateRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.request.ShiftAssignmentRequest;
import java.time.LocalDateTime;
import com.vn.schedule.dto.response.ShiftAssignmentResponse;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ShiftAssignmentService {
    private final ShiftAssignmentRepository repository;
    private final EmployeeRepository employeeRepository;
    private final ShiftByDateRepository shiftByDateRepository;

    public ShiftAssignmentService(ShiftAssignmentRepository repository, EmployeeRepository employeeRepository,
                                  ShiftByDateRepository shiftByDateRepository) {
        this.repository = repository;
        this.employeeRepository = employeeRepository;
        this.shiftByDateRepository = shiftByDateRepository;
    }

    public List<ShiftAssignmentResponse> findAll() {
    return repository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private ShiftAssignmentResponse toResponse(ShiftAssignment entity) {
        ShiftAssignmentResponse response = new ShiftAssignmentResponse();

        response.setId(entity.getId());

        if (entity.getShiftByDate() != null) {
            response.setShiftByDateId(entity.getShiftByDate().getId());
        }

        if (entity.getEmployee() != null) {
            response.setEmployeeId(entity.getEmployee().getId());
        }

        response.setStatus(entity.getStatus());
        response.setRegisteredAt(entity.getRegisteredAt());
        response.setApprovedAt(entity.getApprovedAt());
        response.setCancelledAt(entity.getCancelledAt());
        response.setCancellationReason(entity.getCancellationReason());
        response.setNote(entity.getNote());

        return response;
    }

    public ShiftAssignment findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public ShiftAssignment create(ShiftAssignmentRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public ShiftAssignment update(Integer id, ShiftAssignmentRequest body) {
        ShiftAssignment current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public ShiftAssignment save(ShiftAssignmentRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(ShiftAssignmentRequest body) {
        repository.delete(toEntity(body));
    }
    private ShiftAssignment toEntity(ShiftAssignmentRequest body) {
        ShiftAssignment entity = new ShiftAssignment();
        entity.setId((Integer) body.get("id"));
        entity.setShiftByDate(resolveShiftByDate(body));
        entity.setEmployee(resolveEmployee(body));
        entity.setStatus((String) body.get("status"));
        entity.setRegisteredAt((LocalDateTime) body.get("registeredAt"));
        entity.setApprovedAt((LocalDateTime) body.get("approvedAt"));
        entity.setCancelledAt((LocalDateTime) body.get("cancelledAt"));
        entity.setCancellationReason((String) body.get("cancellationReason"));
        entity.setNote((String) body.get("note"));
        return entity;
    }

    private void applyFields(ShiftAssignment entity, ShiftAssignmentRequest body) {
        entity.setId((Integer) body.get("id"));
        entity.setShiftByDate(resolveShiftByDate(body));
        entity.setEmployee(resolveEmployee(body));
        entity.setStatus((String) body.get("status"));
        entity.setRegisteredAt((LocalDateTime) body.get("registeredAt"));
        entity.setApprovedAt((LocalDateTime) body.get("approvedAt"));
        entity.setCancelledAt((LocalDateTime) body.get("cancelledAt"));
        entity.setCancellationReason((String) body.get("cancellationReason"));
        entity.setNote((String) body.get("note"));
    }

    private ShiftByDate resolveShiftByDate(ShiftAssignmentRequest body) {
        return shiftByDateRepository.getReferenceById(requiredId(body.get("shiftByDate"), "shiftByDate"));
    }

    private Employee resolveEmployee(ShiftAssignmentRequest body) {
        return employeeRepository.getReferenceById(requiredId(body.get("employee"), "employee"));
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
