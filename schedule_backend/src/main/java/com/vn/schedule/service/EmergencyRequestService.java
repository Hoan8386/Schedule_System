package com.vn.schedule.service;

import com.vn.schedule.domain.EmergencyRequest;
import com.vn.schedule.repository.EmergencyRequestRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.request.EmergencyRequestRequest;
import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EmergencyRequestService {
    private final EmergencyRequestRepository repository;
    private final StoreScopeService storeScopeService;
    public EmergencyRequestService(EmergencyRequestRepository repository,
                                   StoreScopeService storeScopeService) {
        this.repository = repository;
        this.storeScopeService = storeScopeService;
    }

    public List<EmergencyRequest> findAll() {
        return repository.findAll().stream()
                .filter(item -> !storeScopeService.isCurrentUserRole("EMPLOYEE")
                        || item.getEmployeeId().equals(storeScopeService.currentEmployeeId()))
                .toList();
    }

    public EmergencyRequest findById(Integer id) {
        EmergencyRequest item = repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
        if (storeScopeService.isCurrentUserRole("EMPLOYEE")
                && !item.getEmployeeId().equals(storeScopeService.currentEmployeeId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Bạn chỉ được xem yêu cầu của mình");
        }
        return item;
    }

    @Transactional
    public EmergencyRequest create(EmergencyRequestRequest body) {
        EmergencyRequest item = toEntity(body);
        if (storeScopeService.isCurrentUserRole("EMPLOYEE")) {
            item.setEmployeeId(storeScopeService.currentEmployeeId());
            // Nhân viên chỉ gửi yêu cầu mới, không tự đặt trạng thái / người xử lý
            item.setStatus("PENDING");
            item.setProcessedBy(null);
            item.setProcessedAt(null);
            item.setProcessNote(null);
        }
        if (item.getStatus() == null) {
            item.setStatus("PENDING");
        }
        if (item.getRequestedAt() == null) {
            item.setRequestedAt(LocalDateTime.now());
        }
        return repository.save(item);
    }

    @Transactional
    public EmergencyRequest update(Integer id, EmergencyRequestRequest body) {
        EmergencyRequest current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    /** Duyệt hàng loạt: chỉ đổi các yêu cầu đang PENDING sang APPROVED, ghi người / thời điểm xử lý. */
    @Transactional
    public int approveAll(List<Integer> ids) {
        Integer processor = currentEmployeeIdOrNull();
        int approved = 0;
        for (Integer id : ids == null ? List.<Integer>of() : ids) {
            EmergencyRequest current = findById(id);
            if (!"PENDING".equalsIgnoreCase(current.getStatus())) continue;
            current.setStatus("APPROVED");
            current.setProcessedAt(LocalDateTime.now());
            current.setProcessedBy(processor);
            repository.save(current);
            approved++;
        }
        return approved;
    }

    private Integer currentEmployeeIdOrNull() {
        try {
            return storeScopeService.currentEmployeeId();
        } catch (ApiException ex) {
            return null;
        }
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
    /** Nhận cả LocalDateTime lẫn chuỗi ISO từ client ("2026-10-19T21:00:00" hoặc có hậu tố Z / múi giờ). */
    private static LocalDateTime dateTime(Object value) {
        if (value instanceof LocalDateTime dateTime) {
            return dateTime;
        }
        if (!(value instanceof String text) || text.isBlank()) {
            return null;
        }
        try {
            return java.time.OffsetDateTime.parse(text)
                    .atZoneSameInstant(java.time.ZoneId.systemDefault())
                    .toLocalDateTime();
        } catch (java.time.format.DateTimeParseException ignored) {
            try {
                return LocalDateTime.parse(text);
            } catch (java.time.format.DateTimeParseException exception) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Thời gian không hợp lệ: " + text);
            }
        }
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
        entity.setRequestedAt(dateTime(body.get("requestedAt")));
        entity.setProcessedBy((Integer) body.get("processedBy"));
        entity.setProcessedAt(dateTime(body.get("processedAt")));
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
        entity.setRequestedAt(dateTime(body.get("requestedAt")));
        entity.setProcessedBy((Integer) body.get("processedBy"));
        entity.setProcessedAt(dateTime(body.get("processedAt")));
        entity.setProcessNote((String) body.get("processNote"));
    }
}
