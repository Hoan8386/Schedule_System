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
    private final StoreScopeService storeScopeService;
    private final ShiftGroupMemberService shiftGroupMemberService;

    public ShiftAssignmentService(ShiftAssignmentRepository repository, EmployeeRepository employeeRepository,
                                  ShiftByDateRepository shiftByDateRepository,
                                  StoreScopeService storeScopeService,
                                  ShiftGroupMemberService shiftGroupMemberService) {
        this.repository = repository;
        this.employeeRepository = employeeRepository;
        this.shiftByDateRepository = shiftByDateRepository;
        this.storeScopeService = storeScopeService;
        this.shiftGroupMemberService = shiftGroupMemberService;
    }

    public List<ShiftAssignmentResponse> findAll() {
    return repository.findAll().stream()
                .filter(item -> !storeScopeService.isCurrentUserRole("EMPLOYEE")
                        || item.getEmployee() != null
                        && item.getEmployee().getId().equals(storeScopeService.currentEmployeeId()))
                .filter(item -> storeScopeService.isGlobalUser()
                        || item.getShiftByDate() != null
                        && item.getShiftByDate().getShift() != null
                        && item.getShiftByDate().getShift().getStore() != null
                        && storeScopeService.visibleStoreIds().contains(
                                item.getShiftByDate().getShift().getStore().getId()))
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
        ShiftAssignment item = repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
        requireAccess(item);
        return item;
    }

    @Transactional
    public ShiftAssignment create(ShiftAssignmentRequest body) {
        ShiftAssignment entity = toEntity(body);
        if (storeScopeService.isCurrentUserRole("EMPLOYEE")
                && (entity.getEmployee() == null
                || !entity.getEmployee().getId().equals(storeScopeService.currentEmployeeId()))) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Bạn chỉ được đăng ký ca cho mình");
        }
        requireAccess(entity);
        requireGroupMembershipForSelfRegistration(entity);
        return repository.save(entity);
    }

    /**
     * Tự đăng ký ca (nhân viên / trưởng cửa hàng đăng ký cho chính mình): ca thuộc nhóm ca nào
     * thì phải là thành viên nhóm đó. Quản lý xếp ca cho người khác không bị giới hạn.
     */
    private void requireGroupMembershipForSelfRegistration(ShiftAssignment entity) {
        if (entity.getEmployee() == null || entity.getShiftByDate() == null) return;
        Integer me = currentEmployeeIdOrNull();
        if (me == null || !me.equals(entity.getEmployee().getId())) return;
        var shift = entity.getShiftByDate().getShift();
        if (shift == null || shift.getShiftGroup() == null) return;
        if (!shiftGroupMemberService.isMember(shift.getShiftGroup().getId(), me)) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "Bạn không thuộc nhóm ca \"" + shift.getShiftGroup().getShiftGroupName() + "\" nên không thể đăng ký ca này");
        }
    }

    @Transactional
    public ShiftAssignment update(Integer id, ShiftAssignmentRequest body) {
        ShiftAssignment current = findById(id);
        applyFields(current, body);
        requireAccess(current);
        return repository.save(current);
    }

    /** Duyệt hàng loạt: chỉ đổi các đăng ký đang PENDING sang APPROVED; trả về số bản ghi đã duyệt. */
    @Transactional
    public int approveAll(List<Integer> ids) {
        int approved = 0;
        for (Integer id : ids == null ? List.<Integer>of() : ids) {
            ShiftAssignment current = findById(id);
            requireAccess(current);
            if (!"PENDING".equalsIgnoreCase(current.getStatus())) continue;
            current.setStatus("APPROVED");
            stampDecision(current);
            repository.save(current);
            approved++;
        }
        return approved;
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
        applyFields(entity, body);
        if (entity.getRegisteredAt() == null) {
            entity.setRegisteredAt(LocalDateTime.now());
        }
        return entity;
    }

    private void requireAccess(ShiftAssignment item) {
        if (storeScopeService.isCurrentUserRole("EMPLOYEE")
                && (item.getEmployee() == null
                || !item.getEmployee().getId().equals(storeScopeService.currentEmployeeId()))) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Bạn chỉ được thao tác trên đăng ký ca của mình");
        }
        Integer storeId = item.getShiftByDate() != null
                && item.getShiftByDate().getShift() != null
                && item.getShiftByDate().getShift().getStore() != null
                ? item.getShiftByDate().getShift().getStore().getId()
                : null;
        storeScopeService.requireStoreAccess(storeId);
    }

    private void applyFields(ShiftAssignment entity, ShiftAssignmentRequest body) {
        entity.setShiftByDate(resolveShiftByDate(body));
        entity.setEmployee(resolveEmployee(body));
        entity.setStatus((String) body.get("status"));
        entity.setRegisteredAt(dateTime(body.get("registeredAt"), "registeredAt", entity.getRegisteredAt()));
        entity.setApprovedBy(integer(body.get("approvedBy"), entity.getApprovedBy()));
        entity.setApprovedAt(dateTime(body.get("approvedAt"), "approvedAt", entity.getApprovedAt()));
        entity.setCancelledBy(integer(body.get("cancelledBy"), entity.getCancelledBy()));
        entity.setCancelledAt(dateTime(body.get("cancelledAt"), "cancelledAt", entity.getCancelledAt()));
        entity.setCancellationReason((String) body.get("cancellationReason"));
        entity.setNote((String) body.get("note"));
        stampDecision(entity);
    }

    /** Ghi nhận người duyệt / người hủy khi trạng thái đổi mà client không gửi kèm. */
    private void stampDecision(ShiftAssignment entity) {
        String status = entity.getStatus() == null ? "" : entity.getStatus().toUpperCase();
        if ("APPROVED".equals(status)) {
            if (entity.getApprovedAt() == null) entity.setApprovedAt(LocalDateTime.now());
            if (entity.getApprovedBy() == null) entity.setApprovedBy(currentEmployeeIdOrNull());
        }
        if ("CANCELLED".equals(status)) {
            if (entity.getCancelledAt() == null) entity.setCancelledAt(LocalDateTime.now());
            if (entity.getCancelledBy() == null) entity.setCancelledBy(currentEmployeeIdOrNull());
        }
    }

    private Integer currentEmployeeIdOrNull() {
        try {
            return storeScopeService.currentEmployeeId();
        } catch (ApiException ex) {
            return null;
        }
    }

    private Integer integer(Object value, Integer fallback) {
        if (value == null || (value instanceof String text && text.isBlank())) return fallback;
        if (value instanceof Number number) return number.intValue();
        try {
            return Integer.valueOf(String.valueOf(value).trim());
        } catch (NumberFormatException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Giá trị không phải số nguyên: " + value);
        }
    }

    private LocalDateTime dateTime(Object value, String fieldName, LocalDateTime fallback) {
        if (value == null || (value instanceof String text && text.isBlank())) return fallback;
        try {
            return LocalDateTime.parse(String.valueOf(value).trim());
        } catch (RuntimeException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, fieldName + " không hợp lệ: " + value);
        }
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
