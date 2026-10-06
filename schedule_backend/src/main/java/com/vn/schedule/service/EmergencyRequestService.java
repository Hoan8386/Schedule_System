package com.vn.schedule.service;

import com.vn.schedule.domain.EmergencyRequest;
import com.vn.schedule.repository.EmergencyRequestRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.EmergencyRequestRequest;
import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EmergencyRequestService {
    private final EmergencyRequestRepository repository;
    public EmergencyRequestService(EmergencyRequestRepository repository) {
        this.repository = repository;
    }

    public List<EmergencyRequest> findAll() {
        return repository.findAll();
    }

    public EmergencyRequest findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public EmergencyRequest create(EmergencyRequestRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public EmergencyRequest update(Integer id, EmergencyRequestRequest body) {
        EmergencyRequest current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public EmergencyRequest save(EmergencyRequestRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(EmergencyRequestRequest body) {
        repository.delete(toEntity(body));
    }
    private EmergencyRequest toEntity(EmergencyRequestRequest body) {
        EmergencyRequest entity = new EmergencyRequest();
        entity.setEmergencyRequestId((Integer) body.get("emergencyRequestId"));
        entity.setEmployeeId((Integer) body.get("employeeId"));
        entity.setAssignmentId((Integer) body.get("assignmentId"));
        entity.setRequestType((String) body.get("requestType"));
        entity.setFromShiftAssignmentId((Integer) body.get("fromShiftAssignmentId"));
        entity.setToAssignmentId((Integer) body.get("toAssignmentId"));
        entity.setReason((String) body.get("reason"));
        entity.setStatus((String) body.get("status"));
        entity.setRequestedAt((LocalDateTime) body.get("requestedAt"));
        entity.setProcessedBy((Integer) body.get("processedBy"));
        entity.setProcessedAt((LocalDateTime) body.get("processedAt"));
        entity.setProcessNote((String) body.get("processNote"));
        return entity;
    }

    private void applyFields(EmergencyRequest entity, EmergencyRequestRequest body) {
        entity.setEmergencyRequestId((Integer) body.get("emergencyRequestId"));
        entity.setEmployeeId((Integer) body.get("employeeId"));
        entity.setAssignmentId((Integer) body.get("assignmentId"));
        entity.setRequestType((String) body.get("requestType"));
        entity.setFromShiftAssignmentId((Integer) body.get("fromShiftAssignmentId"));
        entity.setToAssignmentId((Integer) body.get("toAssignmentId"));
        entity.setReason((String) body.get("reason"));
        entity.setStatus((String) body.get("status"));
        entity.setRequestedAt((LocalDateTime) body.get("requestedAt"));
        entity.setProcessedBy((Integer) body.get("processedBy"));
        entity.setProcessedAt((LocalDateTime) body.get("processedAt"));
        entity.setProcessNote((String) body.get("processNote"));
    }
}
