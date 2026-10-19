package com.vn.schedule.service;

import com.vn.schedule.domain.Employee;
import com.vn.schedule.domain.EmployeeStore;
import com.vn.schedule.domain.Feedback;
import com.vn.schedule.domain.ShiftByDate;
import com.vn.schedule.domain.StoreManager;
import com.vn.schedule.dto.DtoMapper;
import com.vn.schedule.dto.request.FeedbackRequest;
import com.vn.schedule.repository.AttachmentRepository;
import com.vn.schedule.repository.EmployeeRepository;
import com.vn.schedule.repository.EmployeeStoreRepository;
import com.vn.schedule.repository.FeedbackRepository;
import com.vn.schedule.repository.ShiftAssignmentRepository;
import com.vn.schedule.repository.ShiftByDateRepository;
import com.vn.schedule.repository.StoreManagerRepository;
import com.vn.schedule.repository.StoreRepository;
import com.vn.schedule.util.ApiException;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Phản hồi nội bộ giữa các vai trò.
 * - EMPLOYEE gửi tới STORE_MANAGER / MANAGER / ADMIN; STORE_MANAGER gửi tới MANAGER / ADMIN; MANAGER gửi tới ADMIN.
 * - EMPLOYEE chỉ xem phản hồi của mình.
 * - STORE_MANAGER xem phản hồi của mình + phản hồi gửi tới trưởng cửa hàng tại cửa hàng mình quản lý (và trả lời được).
 * - MANAGER / ADMIN xem và trả lời mọi phản hồi.
 */
@Service
public class FeedbackService {
    public static final String EMPLOYEE = "EMPLOYEE";
    public static final String STORE_MANAGER = "STORE_MANAGER";
    public static final String MANAGER = "MANAGER";
    public static final String ADMIN = "ADMIN";

    private static final Map<String, Set<String>> ALLOWED_TARGETS = Map.of(
            EMPLOYEE, Set.of(STORE_MANAGER, MANAGER, ADMIN),
            STORE_MANAGER, Set.of(MANAGER, ADMIN),
            MANAGER, Set.of(ADMIN));
    private static final Set<String> FEEDBACK_TYPES = Set.of("SYSTEM", "SHIFT", "EMPLOYEE", "OTHER");
    private static final Set<String> HANDLE_STATUSES = Set.of("PROCESSING", "RESOLVED", "REJECTED");
    private static final int MAX_ATTACHMENTS = 5;
    private static final DateTimeFormatter DAY = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final FeedbackRepository repository;
    private final StoreScopeService storeScopeService;
    private final EmployeeRepository employeeRepository;
    private final StoreRepository storeRepository;
    private final ShiftByDateRepository shiftByDateRepository;
    private final EmployeeStoreRepository employeeStoreRepository;
    private final StoreManagerRepository storeManagerRepository;
    private final AttachmentRepository attachmentRepository;
    private final R2StorageService storage;
    private final ShiftAssignmentRepository shiftAssignmentRepository;

    public FeedbackService(FeedbackRepository repository,
                           StoreScopeService storeScopeService,
                           EmployeeRepository employeeRepository,
                           StoreRepository storeRepository,
                           ShiftByDateRepository shiftByDateRepository,
                           EmployeeStoreRepository employeeStoreRepository,
                           StoreManagerRepository storeManagerRepository,
                           AttachmentRepository attachmentRepository,
                           R2StorageService storage,
                           ShiftAssignmentRepository shiftAssignmentRepository) {
        this.repository = repository;
        this.storeScopeService = storeScopeService;
        this.employeeRepository = employeeRepository;
        this.storeRepository = storeRepository;
        this.shiftByDateRepository = shiftByDateRepository;
        this.employeeStoreRepository = employeeStoreRepository;
        this.storeManagerRepository = storeManagerRepository;
        this.attachmentRepository = attachmentRepository;
        this.storage = storage;
        this.shiftAssignmentRepository = shiftAssignmentRepository;
    }

    /** Người dùng hiện tại: vai trò, hồ sơ nhân viên (có thể null với ADMIN/MANAGER), cửa hàng được xem (null = toàn chuỗi). */
    private record Viewer(String role, Integer employeeId, Set<Integer> storeIds) {
        boolean global() {
            return ADMIN.equals(role) || MANAGER.equals(role);
        }
    }

    private Viewer viewer() {
        String role = List.of(ADMIN, MANAGER, STORE_MANAGER, EMPLOYEE).stream()
                .filter(storeScopeService::isCurrentUserRole)
                .findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "Tài khoản chưa được gán vai trò"));
        Integer employeeId = null;
        try {
            employeeId = storeScopeService.currentEmployeeId();
        } catch (ApiException ignored) {
            // ADMIN / MANAGER có thể không có hồ sơ nhân viên
        }
        Set<Integer> storeIds = ADMIN.equals(role) || MANAGER.equals(role) ? null : storeScopeService.visibleStoreIds();
        return new Viewer(role, employeeId, storeIds);
    }

    /** Phản hồi cũ chưa có đối tượng nhận được coi là gửi tới trưởng cửa hàng. */
    private static String targetOf(Feedback item) {
        return item.getTargetRole() == null ? STORE_MANAGER : item.getTargetRole();
    }

    private static boolean isSender(Feedback item, Viewer viewer) {
        return viewer.employeeId() != null && Objects.equals(item.getEmployeeId(), viewer.employeeId());
    }

    private boolean canView(Feedback item, Viewer viewer) {
        if (viewer.global() || isSender(item, viewer)) {
            return true;
        }
        return STORE_MANAGER.equals(viewer.role()) && canHandle(item, viewer);
    }

    private boolean canHandle(Feedback item, Viewer viewer) {
        if (isSender(item, viewer)) {
            return false;
        }
        if (viewer.global()) {
            return true;
        }
        return STORE_MANAGER.equals(viewer.role())
                && STORE_MANAGER.equals(targetOf(item))
                && item.getStoreId() != null
                && viewer.storeIds().contains(item.getStoreId());
    }

    // ------------------------------------------------------------------ Truy vấn

    public List<Map<String, Object>> list() {
        Viewer viewer = viewer();
        List<Feedback> items = repository.findAll().stream()
                .filter(item -> canView(item, viewer))
                .sorted(Comparator.comparing(Feedback::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(Feedback::getFeedbackId, Comparator.reverseOrder()))
                .toList();
        return views(items, viewer);
    }

    /** Chi tiết phản hồi, kèm ảnh nhúng sẵn dạng data URL (giống ảnh cửa hàng) để xem trực tiếp. */
    public Map<String, Object> get(Integer id) {
        Viewer viewer = viewer();
        Feedback item = findVisible(id, viewer);
        Map<String, Object> view = views(List.of(item), viewer).get(0);
        view.put("attachments", embeddedImages(splitIds(item.getAttachmentIds())));
        return view;
    }

    private List<Map<String, Object>> embeddedImages(List<Integer> ids) {
        List<Map<String, Object>> images = new ArrayList<>();
        attachmentRepository.findAllById(ids).forEach(attachment -> {
            Map<String, Object> image = new HashMap<>();
            image.put("attachmentId", attachment.getAttachmentId());
            image.put("fileName", attachment.getFileName());
            try {
                byte[] bytes = storage.download(attachment.getFilePath());
                image.put("dataUrl", "data:" + attachment.getFileType() + ";base64," + Base64.getEncoder().encodeToString(bytes));
            } catch (ApiException exception) {
                image.put("dataUrl", null);
            }
            images.add(image);
        });
        return images;
    }

    private Feedback findVisible(Integer id, Viewer viewer) {
        Feedback item = repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy phản hồi"));
        if (!canView(item, viewer)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem phản hồi này");
        }
        return item;
    }

    // ------------------------------------------------------------------ Thao tác

    /** Body: { targetRole, feedbackType, title, content, storeId?, shiftByDateId?, targetEmployeeId?, attachmentIds?: number[] } */
    @Transactional
    public Map<String, Object> create(FeedbackRequest body) {
        Viewer viewer = viewer();
        if (viewer.employeeId() == null) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Tài khoản chưa có hồ sơ nhân viên nên không thể gửi phản hồi");
        }

        String targetRole = upper(body.get("targetRole"));
        Set<String> allowed = ALLOWED_TARGETS.getOrDefault(viewer.role(), Set.of());
        if (targetRole == null || !allowed.contains(targetRole)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, allowed.isEmpty()
                    ? "Vai trò của bạn không gửi phản hồi được"
                    : "Đối tượng nhận phản hồi không hợp lệ");
        }

        String content = text(body.get("content"));
        if (content == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Nội dung phản hồi không được để trống");
        }

        Feedback item = new Feedback();
        item.setEmployeeId(viewer.employeeId());
        item.setSenderRole(viewer.role());
        item.setTargetRole(targetRole);
        item.setContent(content);
        String title = text(body.get("title"));
        item.setTitle(title != null ? truncate(title, 200) : truncate(content, 80));

        Integer shiftByDateId = toInt(body.get("shiftByDateId"));
        Integer storeId = toInt(body.get("storeId"));
        if (shiftByDateId != null) {
            ShiftByDate shift = shiftByDateRepository.findById(shiftByDateId)
                    .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Ca làm liên quan không tồn tại"));
            requireShiftFeedbackWindow(shift, viewer.employeeId());
            item.setShiftByDateId(shiftByDateId);
            if (shift.getShift() != null && shift.getShift().getStore() != null) {
                storeId = shift.getShift().getStore().getId();
            }
        }
        if (storeId == null) {
            storeId = defaultStoreOf(viewer);
        }
        if (storeId != null && !viewer.global() && !viewer.storeIds().contains(storeId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Bạn không thuộc cửa hàng này");
        }
        if (STORE_MANAGER.equals(targetRole) && storeId == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Vui lòng chọn cửa hàng để gửi tới trưởng cửa hàng");
        }
        item.setStoreId(storeId);

        String type = upper(body.get("feedbackType"));
        if (shiftByDateId != null) {
            type = "SHIFT";
        }
        item.setFeedbackType(type != null && FEEDBACK_TYPES.contains(type) ? type : "OTHER");
        item.setTargetEmployeeId(toInt(body.get("targetEmployeeId")));
        item.setAttachmentIds(joinIds(body.get("attachmentIds")));
        item.setStatus("PENDING");
        item.setCreatedAt(LocalDateTime.now());
        return views(List.of(repository.save(item)), viewer).get(0);
    }

    /** Trả lời / cập nhật trạng thái. Body: { response, status: PROCESSING | RESOLVED | REJECTED } */
    @Transactional
    public Map<String, Object> reply(Integer id, FeedbackRequest body) {
        Viewer viewer = viewer();
        Feedback item = findVisible(id, viewer);
        if (!canHandle(item, viewer)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Bạn không có quyền xử lý phản hồi này");
        }
        String status = upper(body.get("status"));
        if (status == null) {
            status = "RESOLVED";
        }
        if (!HANDLE_STATUSES.contains(status)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Trạng thái không hợp lệ");
        }
        String response = text(body.get("response"));
        if (response == null && !"PROCESSING".equals(status)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Vui lòng nhập nội dung trả lời");
        }
        if (response != null) {
            item.setResponse(response);
        }
        item.setStatus(status);
        item.setHandledBy(viewer.employeeId());
        item.setHandledAt(LocalDateTime.now());
        return views(List.of(repository.save(item)), viewer).get(0);
    }

    /** Người gửi thu hồi phản hồi chưa được xử lý; ADMIN xóa được mọi phản hồi. */
    @Transactional
    public void delete(Integer id) {
        Viewer viewer = viewer();
        Feedback item = findVisible(id, viewer);
        boolean ownPending = isSender(item, viewer) && "PENDING".equalsIgnoreCase(item.getStatus());
        if (!ownPending && !ADMIN.equals(viewer.role())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Chỉ thu hồi được phản hồi của mình khi chưa được xử lý");
        }
        repository.delete(item);
    }

    // ------------------------------------------------------------------ Hiển thị

    private List<Map<String, Object>> views(List<Feedback> items, Viewer viewer) {
        Set<Integer> employeeIds = new HashSet<>();
        Set<Integer> storeIds = new HashSet<>();
        Set<Integer> shiftIds = new HashSet<>();
        items.forEach(item -> {
            addIfPresent(employeeIds, item.getEmployeeId());
            addIfPresent(employeeIds, item.getHandledBy());
            addIfPresent(employeeIds, item.getTargetEmployeeId());
            addIfPresent(storeIds, item.getStoreId());
            addIfPresent(shiftIds, item.getShiftByDateId());
        });
        Map<Integer, Employee> employees = byId(employeeRepository.findAllById(employeeIds), Employee::getId);
        Map<Integer, String> stores = new HashMap<>();
        storeRepository.findAllById(storeIds).forEach(store -> stores.put(store.getId(), store.getStoreName()));
        Map<Integer, ShiftByDate> shifts = byId(shiftByDateRepository.findAllById(shiftIds), ShiftByDate::getId);

        return items.stream().map(item -> {
            Map<String, Object> view = DtoMapper.toMap(item);
            Employee sender = employees.get(item.getEmployeeId());
            Employee handler = employees.get(item.getHandledBy());
            Employee target = employees.get(item.getTargetEmployeeId());
            view.put("targetRole", targetOf(item));
            view.put("senderName", sender != null ? sender.getFullName() : null);
            view.put("senderCode", sender != null ? sender.getEmployeeCode() : null);
            view.put("handlerName", handler != null ? handler.getFullName() : null);
            view.put("targetEmployeeName", target != null ? target.getFullName() : null);
            view.put("storeName", stores.get(item.getStoreId()));
            view.put("shiftLabel", shiftLabel(shifts.get(item.getShiftByDateId())));
            view.put("attachmentIdList", splitIds(item.getAttachmentIds()));
            view.put("mine", isSender(item, viewer));
            view.put("canReply", canHandle(item, viewer));
            return view;
        }).collect(Collectors.toList());
    }

    private static String shiftLabel(ShiftByDate shift) {
        if (shift == null) {
            return null;
        }
        String date = shift.getWorkDate() != null ? shift.getWorkDate().format(DAY) : "";
        String name = shift.getShiftName() != null ? shift.getShiftName() : "Ca làm";
        String time = shift.getStartTime() != null && shift.getEndTime() != null
                ? " · " + shift.getStartTime() + " – " + shift.getEndTime()
                : "";
        return date + " · " + name + time;
    }

    /**
     * Phản hồi gắn với ca chỉ được gửi khi người gửi có phân ca đã duyệt (APPROVED) cho ca đó
     * và thời điểm hiện tại nằm trong giờ làm của ca (ca qua đêm tính sang ngày hôm sau).
     */
    private void requireShiftFeedbackWindow(ShiftByDate shift, Integer employeeId) {
        boolean approved = shiftAssignmentRepository.findByShiftByDateId(shift.getId()).stream()
                .anyMatch(assignment -> assignment.getEmployee() != null
                        && Objects.equals(assignment.getEmployee().getId(), employeeId)
                        && "APPROVED".equalsIgnoreCase(assignment.getStatus()));
        if (!approved) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Chỉ phản hồi được ca làm đã được duyệt của bạn");
        }
        LocalTime start = shift.getStartTime() != null ? shift.getStartTime()
                : shift.getShift() != null ? shift.getShift().getStartTime() : null;
        LocalTime end = shift.getEndTime() != null ? shift.getEndTime()
                : shift.getShift() != null ? shift.getShift().getEndTime() : null;
        if (shift.getWorkDate() == null || start == null || end == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Ca làm chưa có thời gian bắt đầu / kết thúc");
        }
        LocalDateTime from = shift.getWorkDate().atTime(start);
        LocalDateTime to = shift.getWorkDate().atTime(end);
        if (!to.isAfter(from)) {
            to = to.plusDays(1);
        }
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(from) || now.isAfter(to)) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Chỉ phản hồi được ca làm trong thời gian diễn ra ca (" + start + " – " + end + ")");
        }
    }

    private Integer defaultStoreOf(Viewer viewer) {
        if (EMPLOYEE.equals(viewer.role())) {
            return employeeStoreRepository.findByEmployeeIdAndStatus(viewer.employeeId(), "ACTIVE").stream()
                    .sorted(Comparator.comparing((EmployeeStore store) -> !Boolean.TRUE.equals(store.getIsPrimary())))
                    .map(EmployeeStore::getStoreId)
                    .findFirst()
                    .orElse(null);
        }
        if (STORE_MANAGER.equals(viewer.role())) {
            return storeManagerRepository.findByEmployeeIdAndStatus(viewer.employeeId(), "ACTIVE").stream()
                    .map(StoreManager::getStoreId)
                    .findFirst()
                    .orElse(null);
        }
        return null;
    }

    // ------------------------------------------------------------------ Tiện ích

    private static <T> Map<Integer, T> byId(Iterable<T> values, java.util.function.Function<T, Integer> id) {
        Map<Integer, T> map = new HashMap<>();
        values.forEach(value -> map.put(id.apply(value), value));
        return map;
    }

    private static void addIfPresent(Set<Integer> target, Integer value) {
        if (value != null) {
            target.add(value);
        }
    }

    private static Integer toInt(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        if (value instanceof String text && !text.isBlank()) {
            try {
                return Integer.valueOf(text.trim());
            } catch (NumberFormatException exception) {
                return null;
            }
        }
        return null;
    }

    private static String text(Object value) {
        if (value == null) {
            return null;
        }
        String text = value.toString().trim();
        return text.isEmpty() ? null : text;
    }

    private static String upper(Object value) {
        String text = text(value);
        return text == null ? null : text.toUpperCase();
    }

    private static String truncate(String value, int max) {
        String firstLine = value.lines().findFirst().orElse(value);
        return firstLine.length() <= max ? firstLine : firstLine.substring(0, max - 1) + "…";
    }

    private static String joinIds(Object value) {
        if (!(value instanceof Collection<?> values)) {
            return null;
        }
        List<Integer> ids = values.stream().map(FeedbackService::toInt).filter(Objects::nonNull).distinct().toList();
        if (ids.size() > MAX_ATTACHMENTS) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Chỉ đính kèm tối đa " + MAX_ATTACHMENTS + " ảnh");
        }
        return ids.isEmpty() ? null : ids.stream().map(String::valueOf).collect(Collectors.joining(","));
    }

    private static List<Integer> splitIds(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        return Arrays.stream(value.split(",")).map(FeedbackService::toInt).filter(Objects::nonNull).toList();
    }
}
