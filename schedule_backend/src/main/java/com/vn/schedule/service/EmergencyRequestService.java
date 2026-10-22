package com.vn.schedule.service;

import com.vn.schedule.domain.EmergencyRequest;
import com.vn.schedule.domain.ShiftAssignment;
import com.vn.schedule.domain.ShiftByDate;
import com.vn.schedule.repository.EmergencyRequestRepository;
import com.vn.schedule.repository.EmployeeRepository;
import com.vn.schedule.repository.ShiftAssignmentRepository;
import com.vn.schedule.repository.ShiftByDateRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.request.EmergencyRequestRequest;
import java.time.LocalDateTime;
import java.time.LocalTime;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Set;

/**
 * Đặt lịch khẩn của nhân viên – chỉ áp dụng cho lịch đang dùng (kỳ đã kết thúc đăng ký)
 * và chỉ cho ca bắt đầu sau thời điểm hiện tại:
 * - CANCEL: hủy ca đã được duyệt.
 * - CHANGE: đổi ca đã được duyệt với một đồng nghiệp đang ở ca đích (đổi người, giữ nguyên số lượng mỗi ca).
 * - ADD: đăng ký thêm một ca.
 * Cột theo khóa ngoại của bảng emergency_request:
 *   assignment_id → shift_assignment (phân ca nguồn),
 *   from_shift_assignment_id → shift_by_date (ca nguồn), to_assignment_id → shift_by_date (ca đích),
 *   swap_assignment_id → shift_assignment (phân ca của đồng nghiệp ở ca đích, chỉ với CHANGE).
 * Khi được duyệt, thay đổi được áp dụng ngay vào bảng phân ca.
 */
@Service
public class EmergencyRequestService {
    private static final Set<String> TYPES = Set.of("ADD", "CHANGE", "CANCEL");
    private static final Set<String> INACTIVE = Set.of("CANCELLED", "REJECTED");

    private final EmergencyRequestRepository repository;
    private final StoreScopeService storeScopeService;
    private final ShiftAssignmentRepository assignmentRepository;
    private final ShiftByDateRepository shiftByDateRepository;
    private final EmployeeRepository employeeRepository;
    private final ShiftGroupMemberService memberService;

    public EmergencyRequestService(EmergencyRequestRepository repository,
                                   StoreScopeService storeScopeService,
                                   ShiftAssignmentRepository assignmentRepository,
                                   ShiftByDateRepository shiftByDateRepository,
                                   EmployeeRepository employeeRepository,
                                   ShiftGroupMemberService memberService) {
        this.repository = repository;
        this.storeScopeService = storeScopeService;
        this.assignmentRepository = assignmentRepository;
        this.shiftByDateRepository = shiftByDateRepository;
        this.employeeRepository = employeeRepository;
        this.memberService = memberService;
    }

    public List<EmergencyRequest> findAll() {
        // Nhân viên chỉ thấy yêu cầu của mình: lọc tại DB thay vì tải toàn bảng rồi kiểm tra vai trò cho từng dòng.
        // Mới gửi trước (requestedAt giảm dần, trùng thì id giảm dần).
        return storeScopeService.isCurrentUserRole("EMPLOYEE")
                ? repository.findByEmployeeIdOrderByRequestedAtDescEmergencyRequestIdDesc(storeScopeService.currentEmployeeId())
                : repository.findAll(org.springframework.data.domain.Sort.by(
                        org.springframework.data.domain.Sort.Order.desc("requestedAt"),
                        org.springframework.data.domain.Sort.Order.desc("emergencyRequestId")));
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
            validateEmployeeRequest(item);
        }
        if (item.getStatus() == null) {
            item.setStatus("PENDING");
        }
        if (item.getRequestedAt() == null) {
            item.setRequestedAt(LocalDateTime.now());
        }
        EmergencyRequest saved = repository.save(item);
        if ("APPROVED".equalsIgnoreCase(saved.getStatus())) {
            applyApproval(saved);
        }
        return saved;
    }

    @Transactional
    public EmergencyRequest update(Integer id, EmergencyRequestRequest body) {
        EmergencyRequest current = findById(id);
        boolean wasApproved = "APPROVED".equalsIgnoreCase(current.getStatus());
        applyFields(current, body);
        if (!wasApproved && "APPROVED".equalsIgnoreCase(current.getStatus())) {
            if (current.getProcessedAt() == null) current.setProcessedAt(LocalDateTime.now());
            if (current.getProcessedBy() == null) current.setProcessedBy(currentEmployeeIdOrNull());
            applyApproval(current);
        }
        return repository.save(current);
    }

    /** Duyệt hàng loạt: chỉ đổi các yêu cầu đang PENDING sang APPROVED, ghi người / thời điểm xử lý và áp dụng vào lịch. */
    @Transactional
    public int approveAll(List<Integer> ids) {
        Integer processor = currentEmployeeIdOrNull();
        int approved = 0;
        for (Integer id : ids == null ? List.<Integer>of() : ids) {
            EmergencyRequest current = findById(id);
            if (!"PENDING".equalsIgnoreCase(current.getStatus())) continue;
            // Yêu cầu đã lỗi thời (ca đã đổi / đã bắt đầu) thì bỏ qua, không làm hỏng cả lô
            try {
                requireApprovable(current);
            } catch (ApiException ex) {
                continue;
            }
            current.setStatus("APPROVED");
            current.setProcessedAt(LocalDateTime.now());
            current.setProcessedBy(processor);
            applyApproval(current);
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

    // ------------------------------------------------------------------ Nghiệp vụ

    /** Kiểm tra yêu cầu do nhân viên gửi. */
    private void validateEmployeeRequest(EmergencyRequest item) {
        String type = item.getRequestType() == null ? null : item.getRequestType().trim().toUpperCase();
        if (type == null || !TYPES.contains(type)) {
            throw bad("Loại yêu cầu không hợp lệ (chỉ Thêm ca / Đổi ca / Hủy ca)");
        }
        item.setRequestType(type);
        if (item.getReason() == null || item.getReason().isBlank()) {
            throw bad("Vui lòng nhập lý do");
        }
        Integer me = item.getEmployeeId();

        ShiftAssignment source = null;
        if (!"ADD".equals(type)) {
            if (item.getAssignmentId() == null) throw bad("Vui lòng chọn ca hiện tại");
            source = assignmentRepository.findById(item.getAssignmentId())
                    .orElseThrow(() -> bad("Không tìm thấy ca đã phân"));
            if (source.getEmployee() == null || !Objects.equals(source.getEmployee().getId(), me)) {
                throw new ApiException(HttpStatus.FORBIDDEN, "Ca này không phải của bạn");
            }
            if (!"APPROVED".equalsIgnoreCase(source.getStatus())) {
                throw bad("Chỉ gửi yêu cầu cho ca đã được duyệt. Ca đang chờ duyệt có thể bỏ đăng ký trực tiếp");
            }
            requireUpcomingReleased(source.getShiftByDate(), "Ca hiện tại");
            // Kể cả khi ca này là ca đối tác trong yêu cầu đổi ca của người khác
            if (repository.existsPendingForAssignment(source.getId())) throw bad("Ca này đã có yêu cầu đang chờ duyệt");
            item.setFromShiftAssignmentId(source.getShiftByDate().getId());
        } else {
            item.setAssignmentId(null);
            item.setFromShiftAssignmentId(null);
        }

        if (!"CHANGE".equals(type)) {
            item.setSwapAssignmentId(null);
        }
        if ("CANCEL".equals(type)) {
            item.setToAssignmentId(null);
            return;
        }

        if (item.getToAssignmentId() == null) {
            throw bad("ADD".equals(type) ? "Vui lòng chọn ca muốn thêm" : "Vui lòng chọn ca muốn đổi sang");
        }
        ShiftByDate target = shiftByDateRepository.findById(item.getToAssignmentId())
                .orElseThrow(() -> bad("Không tìm thấy ca muốn chọn"));
        requireUpcomingReleased(target, "Ca được chọn");
        if (target.getShift() == null || target.getShift().getShiftGroup() == null
                || !memberService.isMember(target.getShift().getShiftGroup().getId(), me)) {
            throw bad("Bạn không thuộc nhóm ca của ca được chọn");
        }
        if (source != null) {
            if (Objects.equals(source.getShiftByDate().getId(), target.getId())) throw bad("Ca muốn đổi sang trùng ca hiện tại");
            Integer sourceStore = source.getShiftByDate().getShift().getStore().getId();
            if (!Objects.equals(sourceStore, target.getShift().getStore().getId())) {
                throw bad("Chỉ đổi sang ca cùng cửa hàng");
            }
        }
        boolean alreadyIn = assignmentRepository.findByShiftByDateId(target.getId()).stream()
                .anyMatch(assignment -> assignment.getEmployee() != null
                        && Objects.equals(assignment.getEmployee().getId(), me)
                        && !INACTIVE.contains(String.valueOf(assignment.getStatus()).toUpperCase()));
        if (alreadyIn) throw bad("Bạn đã có ca được chọn rồi");
        boolean pendingAdd = "ADD".equals(type) && repository.existsPendingAdd(me, target.getId());
        if (pendingAdd) throw bad("Bạn đã gửi yêu cầu thêm ca này, đang chờ duyệt");

        if ("CHANGE".equals(type)) {
            validateSwap(item, source, target);
        }
    }

    /** Đổi ca: bắt buộc chọn đồng nghiệp đang ở ca đích; đồng nghiệp phải làm được ca hiện tại của mình. */
    private void validateSwap(EmergencyRequest item, ShiftAssignment source, ShiftByDate target) {
        if (item.getSwapAssignmentId() == null) throw bad("Vui lòng chọn nhân viên muốn đổi ca cùng");
        ShiftAssignment partner = assignmentRepository.findById(item.getSwapAssignmentId())
                .orElseThrow(() -> bad("Không tìm thấy phân ca của nhân viên được chọn"));
        if (partner.getShiftByDate() == null || !Objects.equals(partner.getShiftByDate().getId(), target.getId())) {
            throw bad("Nhân viên được chọn không làm ca muốn đổi sang");
        }
        if (!"APPROVED".equalsIgnoreCase(partner.getStatus()) || partner.getEmployee() == null) {
            throw bad("Nhân viên được chọn chưa được duyệt vào ca này");
        }
        Integer partnerId = partner.getEmployee().getId();
        if (Objects.equals(partnerId, item.getEmployeeId())) throw bad("Không thể đổi ca với chính mình");
        ShiftByDate sourceShift = source.getShiftByDate();
        if (sourceShift.getShift() == null || sourceShift.getShift().getShiftGroup() == null
                || !memberService.isMember(sourceShift.getShift().getShiftGroup().getId(), partnerId)) {
            throw bad("Nhân viên được chọn không thuộc nhóm ca của ca hiện tại của bạn");
        }
        boolean partnerInSource = assignmentRepository.findByShiftByDateId(sourceShift.getId()).stream()
                .anyMatch(assignment -> assignment.getEmployee() != null
                        && Objects.equals(assignment.getEmployee().getId(), partnerId)
                        && !INACTIVE.contains(String.valueOf(assignment.getStatus()).toUpperCase()));
        if (partnerInSource) throw bad("Nhân viên được chọn đã có trong ca hiện tại của bạn");
        if (repository.existsPendingForAssignment(partner.getId())) throw bad("Ca của nhân viên được chọn đang có yêu cầu chờ duyệt");
    }

    /** Chỉ Đặt lịch khẩn cho ca thuộc lịch đang dùng (kỳ đã kết thúc đăng ký) và bắt đầu sau thời điểm hiện tại. */
    private void requireUpcomingReleased(ShiftByDate shift, String label) {
        LocalTime start = shift.getStartTime() != null ? shift.getStartTime()
                : shift.getShift() != null ? shift.getShift().getStartTime() : null;
        LocalDateTime startAt = shift.getWorkDate().atTime(start != null ? start : LocalTime.MIN);
        if (!startAt.isAfter(LocalDateTime.now())) {
            throw bad(label + " đã bắt đầu hoặc đã qua – chỉ chọn được ca sau thời điểm hiện tại");
        }
        if (!memberService.isReleased(shift.getId())) {
            throw bad(label + " thuộc kỳ đang đăng ký – hãy đăng ký / bỏ đăng ký ở trang Đăng ký ca");
        }
    }

    /**
     * Kiểm tra yêu cầu còn áp dụng được lúc duyệt (chỉ đọc, chưa thay đổi gì):
     * đổi ca với đồng nghiệp thì cả hai phân ca còn APPROVED; ca được đưa người vào chưa bắt đầu.
     */
    private void requireApprovable(EmergencyRequest request) {
        String type = request.getRequestType() == null ? "" : request.getRequestType().toUpperCase();
        if ("CHANGE".equals(type) && request.getSwapAssignmentId() != null) {
            ShiftAssignment mine = assignmentRepository.findById(request.getAssignmentId())
                    .orElseThrow(() -> bad("Không tìm thấy ca hiện tại của người gửi"));
            ShiftAssignment partner = assignmentRepository.findById(request.getSwapAssignmentId())
                    .orElseThrow(() -> bad("Không tìm thấy phân ca của nhân viên đổi cùng"));
            if (!"APPROVED".equalsIgnoreCase(mine.getStatus()) || !"APPROVED".equalsIgnoreCase(partner.getStatus())
                    || mine.getEmployee() == null || partner.getEmployee() == null) {
                throw bad("Một trong hai ca đã thay đổi, không thể đổi ca");
            }
            requireNotStarted(mine.getShiftByDate(), "Ca hiện tại");
            requireNotStarted(partner.getShiftByDate(), "Ca muốn đổi sang");
            return;
        }
        if (("ADD".equals(type) || "CHANGE".equals(type)) && request.getToAssignmentId() != null) {
            ShiftByDate target = shiftByDateRepository.findById(request.getToAssignmentId()).orElse(null);
            if (target != null) requireNotStarted(target, "ADD".equals(type) ? "Ca muốn thêm" : "Ca muốn đổi sang");
        }
    }

    private void requireNotStarted(ShiftByDate shift, String label) {
        if (shift == null || shift.getWorkDate() == null) return;
        LocalTime start = shift.getStartTime() != null ? shift.getStartTime()
                : shift.getShift() != null ? shift.getShift().getStartTime() : null;
        if (!shift.getWorkDate().atTime(start != null ? start : LocalTime.MIN).isAfter(LocalDateTime.now())) {
            throw bad(label + " đã bắt đầu hoặc đã qua, không thể duyệt yêu cầu");
        }
    }

    /** Áp dụng yêu cầu đã duyệt vào bảng phân ca. */
    private void applyApproval(EmergencyRequest request) {
        requireApprovable(request);
        String type = request.getRequestType() == null ? "" : request.getRequestType().toUpperCase();
        Integer processor = request.getProcessedBy();
        LocalDateTime now = LocalDateTime.now();
        if ("CHANGE".equals(type) && request.getSwapAssignmentId() != null) {
            applySwap(request, processor, now);
            return;
        }
        if ("CANCEL".equals(type) || "CHANGE".equals(type)) {
            Integer sourceId = request.getAssignmentId();
            if (sourceId != null) {
                assignmentRepository.findById(sourceId).ifPresent(assignment -> {
                    assignment.setStatus("CANCELLED");
                    assignment.setCancelledAt(now);
                    assignment.setCancelledBy(processor);
                    assignment.setCancellationReason(("CHANGE".equals(type) ? "Đổi ca: " : "Hủy ca: ") + request.getReason());
                    assignmentRepository.save(assignment);
                });
            }
        }
        if (("ADD".equals(type) || "CHANGE".equals(type)) && request.getToAssignmentId() != null) {
            ShiftByDate target = shiftByDateRepository.findById(request.getToAssignmentId()).orElse(null);
            if (target == null) return;
            Integer employeeId = request.getEmployeeId();
            // Dùng lại bản ghi phân ca cũ (nếu từng hủy) vì mỗi nhân viên chỉ có 1 bản ghi / ca theo ngày
            ShiftAssignment assignment = assignmentRepository.findByShiftByDateId(target.getId()).stream()
                    .filter(item -> item.getEmployee() != null && Objects.equals(item.getEmployee().getId(), employeeId))
                    .findFirst()
                    .orElseGet(() -> {
                        ShiftAssignment created = new ShiftAssignment();
                        created.setShiftByDate(target);
                        created.setEmployee(employeeRepository.getReferenceById(employeeId));
                        created.setRegisteredAt(now);
                        return created;
                    });
            assignment.setStatus("APPROVED");
            assignment.setApprovedBy(processor);
            assignment.setApprovedAt(now);
            assignment.setCancelledAt(null);
            assignment.setCancelledBy(null);
            assignment.setCancellationReason(null);
            assignment.setNote(("ADD".equals(type) ? "Thêm ca" : "Đổi ca") + " theo yêu cầu #" + request.getEmergencyRequestId());
            assignmentRepository.save(assignment);
        }
    }

    /** Đổi ca với đồng nghiệp: mình sang ca đích, đồng nghiệp sang ca hiện tại của mình – số lượng mỗi ca giữ nguyên. */
    private void applySwap(EmergencyRequest request, Integer processor, LocalDateTime now) {
        ShiftAssignment mine = assignmentRepository.findById(request.getAssignmentId())
                .orElseThrow(() -> bad("Không tìm thấy ca hiện tại của người gửi"));
        ShiftAssignment partner = assignmentRepository.findById(request.getSwapAssignmentId())
                .orElseThrow(() -> bad("Không tìm thấy phân ca của nhân viên đổi cùng"));
        if (!"APPROVED".equalsIgnoreCase(mine.getStatus()) || !"APPROVED".equalsIgnoreCase(partner.getStatus())
                || mine.getEmployee() == null || partner.getEmployee() == null) {
            throw bad("Một trong hai ca đã thay đổi, không thể đổi ca");
        }
        ShiftByDate sourceShift = mine.getShiftByDate();
        ShiftByDate targetShift = partner.getShiftByDate();
        Integer me = mine.getEmployee().getId();
        Integer partnerId = partner.getEmployee().getId();
        String reason = "Đổi ca theo yêu cầu #" + request.getEmergencyRequestId();
        for (ShiftAssignment old : List.of(mine, partner)) {
            old.setStatus("CANCELLED");
            old.setCancelledAt(now);
            old.setCancelledBy(processor);
            old.setCancellationReason("Đổi ca: " + request.getReason());
            assignmentRepository.save(old);
        }
        approveInto(targetShift, me, processor, now, reason);
        approveInto(sourceShift, partnerId, processor, now, reason);
    }

    /** Phân nhân viên vào ca theo ngày (dùng lại bản ghi cũ nếu có, vì mỗi nhân viên chỉ có 1 bản ghi / ca theo ngày). */
    private void approveInto(ShiftByDate shift, Integer employeeId, Integer processor, LocalDateTime now, String note) {
        ShiftAssignment assignment = assignmentRepository.findByShiftByDateId(shift.getId()).stream()
                .filter(item -> item.getEmployee() != null && Objects.equals(item.getEmployee().getId(), employeeId))
                .findFirst()
                .orElseGet(() -> {
                    ShiftAssignment created = new ShiftAssignment();
                    created.setShiftByDate(shift);
                    created.setEmployee(employeeRepository.getReferenceById(employeeId));
                    created.setRegisteredAt(now);
                    return created;
                });
        assignment.setStatus("APPROVED");
        assignment.setApprovedBy(processor);
        assignment.setApprovedAt(now);
        assignment.setCancelledAt(null);
        assignment.setCancelledBy(null);
        assignment.setCancellationReason(null);
        assignment.setNote(note);
        assignmentRepository.save(assignment);
    }

    // ------------------------------------------------------------------ Chuyển đổi dữ liệu

    private static ApiException bad(String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, message);
    }

    private static Integer toInt(Object value) {
        if (value instanceof Number number) return number.intValue();
        if (value instanceof String text && !text.isBlank()) {
            try {
                return Integer.valueOf(text.trim());
            } catch (NumberFormatException exception) {
                return null;
            }
        }
        return null;
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
        entity.setEmergencyRequestId(toInt(body.get("emergencyRequestId")));
        entity.setEmployeeId(toInt(body.get("employeeId")));
        entity.setAssignmentId(toInt(body.get("assignmentId")));
        entity.setRequestType((String) body.get("requestType"));
        entity.setFromShiftAssignmentId(toInt(body.get("fromShiftAssignmentId")));
        entity.setToAssignmentId(toInt(body.get("toAssignmentId")));
        entity.setSwapAssignmentId(toInt(body.get("swapAssignmentId")));
        entity.setReason((String) body.get("reason"));
        entity.setStatus((String) body.get("status"));
        entity.setRequestedAt(dateTime(body.get("requestedAt")));
        entity.setProcessedBy(toInt(body.get("processedBy")));
        entity.setProcessedAt(dateTime(body.get("processedAt")));
        entity.setProcessNote((String) body.get("processNote"));
        return entity;
    }

    /** Chỉ cập nhật các trường client gửi lên (trường vắng mặt giữ nguyên giá trị cũ). */
    private void applyFields(EmergencyRequest entity, EmergencyRequestRequest body) {
        java.util.Map<String, Object> values = body.values();
        if (values.containsKey("employeeId") && toInt(body.get("employeeId")) != null) entity.setEmployeeId(toInt(body.get("employeeId")));
        if (values.containsKey("assignmentId")) entity.setAssignmentId(toInt(body.get("assignmentId")));
        if (values.containsKey("requestType")) entity.setRequestType((String) body.get("requestType"));
        if (values.containsKey("fromShiftAssignmentId")) entity.setFromShiftAssignmentId(toInt(body.get("fromShiftAssignmentId")));
        if (values.containsKey("toAssignmentId")) entity.setToAssignmentId(toInt(body.get("toAssignmentId")));
        if (values.containsKey("swapAssignmentId")) entity.setSwapAssignmentId(toInt(body.get("swapAssignmentId")));
        if (values.containsKey("reason")) entity.setReason((String) body.get("reason"));
        if (values.containsKey("status")) entity.setStatus((String) body.get("status"));
        if (values.containsKey("requestedAt")) entity.setRequestedAt(dateTime(body.get("requestedAt")));
        if (values.containsKey("processedBy")) entity.setProcessedBy(toInt(body.get("processedBy")));
        if (values.containsKey("processedAt")) entity.setProcessedAt(dateTime(body.get("processedAt")));
        if (values.containsKey("processNote")) entity.setProcessNote((String) body.get("processNote"));
    }
}
