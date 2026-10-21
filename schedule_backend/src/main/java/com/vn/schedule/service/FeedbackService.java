package com.vn.schedule.service;

import com.vn.schedule.domain.Employee;
import com.vn.schedule.domain.EmployeeStore;
import com.vn.schedule.domain.Feedback;
import com.vn.schedule.domain.FeedbackHistory;
import com.vn.schedule.domain.ShiftByDate;
import com.vn.schedule.domain.StoreManager;
import com.vn.schedule.dto.DtoMapper;
import com.vn.schedule.dto.request.FeedbackRequest;
import com.vn.schedule.repository.AttachmentRepository;
import com.vn.schedule.repository.EmployeeRepository;
import com.vn.schedule.repository.EmployeeStoreRepository;
import com.vn.schedule.repository.FeedbackHistoryRepository;
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
 * - 3 loại: SHIFT (Ca làm – bắt buộc chọn ca), EMPLOYEE (Đồng nghiệp – chọn người không bắt buộc), SYSTEM (Hệ thống – luôn gửi admin).
 * - EMPLOYEE gửi Ca làm / Đồng nghiệp tới STORE_MANAGER hoặc MANAGER; STORE_MANAGER gửi tới MANAGER; MANAGER chỉ gửi loại Hệ thống.
 * - Trạng thái: PENDING → REVIEWED | CLOSED; REVIEWED → RESOLVED; RESOLVED → REVIEWED | CLOSED; CLOSED là trạng thái cuối.
 * - Người gửi chỉ xem lại phản hồi, không sửa / thu hồi.
 * - EMPLOYEE chỉ xem phản hồi của mình.
 * - STORE_MANAGER xem phản hồi của mình + phản hồi gửi tới trưởng cửa hàng tại cửa hàng mình quản lý (và trả lời được).
 * - MANAGER (quản lý chuỗi) / ADMIN xem và xử lý mọi phản hồi; phản hồi gửi trưởng cửa hàng mà quản lý xử lý = phản hồi thay.
 * - Mỗi lần chuyển trạng thái được kèm ghi chú (nhận xét) riêng, lưu ở feedback_history.
 */
@Service
public class FeedbackService {
    public static final String EMPLOYEE = "EMPLOYEE";
    public static final String STORE_MANAGER = "STORE_MANAGER";
    public static final String MANAGER = "MANAGER";
    public static final String ADMIN = "ADMIN";

    public static final String SHIFT = "SHIFT";
    public static final String COLLEAGUE = "EMPLOYEE";
    public static final String SYSTEM = "SYSTEM";

    /** Loại phản hồi mỗi vai trò được gửi. */
    private static final Map<String, Set<String>> ALLOWED_TYPES = Map.of(
            EMPLOYEE, Set.of(SHIFT, COLLEAGUE, SYSTEM),
            STORE_MANAGER, Set.of(SHIFT, COLLEAGUE, SYSTEM),
            MANAGER, Set.of(SYSTEM));
    /** Đối tượng nhận của loại Ca làm / Đồng nghiệp (loại Hệ thống luôn gửi ADMIN). */
    private static final Map<String, Set<String>> ALLOWED_TARGETS = Map.of(
            EMPLOYEE, Set.of(STORE_MANAGER, MANAGER),
            STORE_MANAGER, Set.of(MANAGER));
    /** Chuyển trạng thái hợp lệ; CLOSED là trạng thái cuối. */
    private static final Map<String, Set<String>> TRANSITIONS = Map.of(
            "PENDING", Set.of("REVIEWED", "CLOSED"),
            "REVIEWED", Set.of("RESOLVED"),
            "RESOLVED", Set.of("REVIEWED", "CLOSED"),
            "CLOSED", Set.of());
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
    private final FeedbackHistoryRepository historyRepository;

    public FeedbackService(FeedbackRepository repository,
                           StoreScopeService storeScopeService,
                           EmployeeRepository employeeRepository,
                           StoreRepository storeRepository,
                           ShiftByDateRepository shiftByDateRepository,
                           EmployeeStoreRepository employeeStoreRepository,
                           StoreManagerRepository storeManagerRepository,
                           AttachmentRepository attachmentRepository,
                           R2StorageService storage,
                           ShiftAssignmentRepository shiftAssignmentRepository,
                           FeedbackHistoryRepository historyRepository) {
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
        this.historyRepository = historyRepository;
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
            // Quản lý chuỗi / admin xử lý được mọi phản hồi, kể cả phản hồi thay trưởng cửa hàng
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

    /** Số phản hồi chờ xử lý mà người hiện tại xử lý được (cùng phạm vi canHandle) – đếm trực tiếp, không dựng danh sách. */
    public long countPendingToHandle() {
        Viewer viewer = viewer();
        if (viewer.global()) {
            return repository.countPendingExceptSender(viewer.employeeId());
        }
        if (!STORE_MANAGER.equals(viewer.role()) || viewer.storeIds() == null || viewer.storeIds().isEmpty()) {
            return 0;
        }
        return repository.countPendingForStoreManager(viewer.employeeId(), viewer.storeIds());
    }

    /** Chi tiết phản hồi, kèm ảnh nhúng sẵn dạng data URL (giống ảnh cửa hàng) để xem trực tiếp. */
    public Map<String, Object> get(Integer id) {
        Viewer viewer = viewer();
        Feedback item = findVisible(id, viewer);
        Map<String, Object> view = views(List.of(item), viewer).get(0);
        view.put("attachments", embeddedImages(splitIds(item.getAttachmentIds())));
        view.put("history", history(item.getFeedbackId()));
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

    /** Body: { feedbackType, targetRole?, title, content, storeId?, shiftByDateId?, targetEmployeeId?, attachmentIds?: number[] } */
    @Transactional
    public Map<String, Object> create(FeedbackRequest body) {
        Viewer viewer = viewer();
        if (viewer.employeeId() == null) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Tài khoản chưa có hồ sơ nhân viên nên không thể gửi phản hồi");
        }

        String type = upper(body.get("feedbackType"));
        Set<String> allowedTypes = ALLOWED_TYPES.getOrDefault(viewer.role(), Set.of());
        if (allowedTypes.isEmpty()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Vai trò của bạn không gửi phản hồi được");
        }
        if (type == null || !allowedTypes.contains(type)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Loại phản hồi không hợp lệ");
        }

        // Hệ thống luôn gửi admin; Ca làm / Đồng nghiệp chọn trưởng cửa hàng hoặc quản lý
        String targetRole;
        if (SYSTEM.equals(type)) {
            targetRole = ADMIN;
        } else {
            Set<String> allowedTargets = ALLOWED_TARGETS.getOrDefault(viewer.role(), Set.of());
            targetRole = upper(body.get("targetRole"));
            if (targetRole == null && allowedTargets.size() == 1) {
                targetRole = allowedTargets.iterator().next();
            }
            if (targetRole == null || !allowedTargets.contains(targetRole)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Đối tượng nhận phản hồi không hợp lệ");
            }
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

        Integer shiftByDateId = SHIFT.equals(type) ? toInt(body.get("shiftByDateId")) : null;
        if (SHIFT.equals(type) && shiftByDateId == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Phản hồi loại Ca làm phải chọn ca cụ thể");
        }
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

        item.setFeedbackType(type);
        Integer targetEmployeeId = COLLEAGUE.equals(type) ? toInt(body.get("targetEmployeeId")) : null;
        if (targetEmployeeId != null) {
            boolean colleague = colleagueIds(viewer).contains(targetEmployeeId);
            if (!colleague) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Đồng nghiệp được chọn không cùng cửa hàng với bạn");
            }
        }
        item.setTargetEmployeeId(targetEmployeeId);
        item.setAttachmentIds(joinIds(body.get("attachmentIds")));
        item.setStatus("PENDING");
        item.setCreatedAt(LocalDateTime.now());
        return views(List.of(repository.save(item)), viewer).get(0);
    }

    /** Chuyển trạng thái kèm ghi chú (nhận xét) cho lần chuyển này. Body: { status: REVIEWED | RESOLVED | CLOSED, response? } */
    @Transactional
    public Map<String, Object> reply(Integer id, FeedbackRequest body) {
        Viewer viewer = viewer();
        Feedback item = findVisible(id, viewer);
        if (!canHandle(item, viewer)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Bạn không có quyền xử lý phản hồi này");
        }
        String current = normalizeStatus(item.getStatus());
        String status = upper(body.get("status"));
        if ("CLOSED".equals(current)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Phản hồi đã đóng, không thể chuyển trạng thái");
        }
        if (status == null || !TRANSITIONS.getOrDefault(current, Set.of()).contains(status)) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Không thể chuyển từ " + current + " sang " + (status == null ? "(trống)" : status));
        }
        String note = text(body.get("response"));
        LocalDateTime now = LocalDateTime.now();
        if (note != null) {
            item.setResponse(note);
        }
        item.setStatus(status);
        item.setHandledBy(viewer.employeeId());
        item.setHandlerRole(viewer.role());
        item.setHandledAt(now);
        Feedback saved = repository.save(item);

        FeedbackHistory entry = new FeedbackHistory();
        entry.setFeedbackId(saved.getFeedbackId());
        entry.setFromStatus(current);
        entry.setToStatus(status);
        entry.setNote(note);
        entry.setHandledBy(viewer.employeeId());
        entry.setHandlerRole(viewer.role());
        entry.setCreatedAt(now);
        historyRepository.save(entry);

        Map<String, Object> view = views(List.of(saved), viewer).get(0);
        view.put("history", history(saved.getFeedbackId()));
        return view;
    }

    /** Dòng thời gian chuyển trạng thái (cũ → mới) kèm ghi chú từng lần. */
    private List<Map<String, Object>> history(Integer feedbackId) {
        List<FeedbackHistory> entries = historyRepository.findByFeedbackIdOrderByCreatedAtAscHistoryIdAsc(feedbackId);
        Set<Integer> handlerIds = new HashSet<>();
        entries.forEach(entry -> addIfPresent(handlerIds, entry.getHandledBy()));
        Map<Integer, Employee> handlers = byId(employeeRepository.findAllById(handlerIds), Employee::getId);
        return entries.stream().map(entry -> {
            Employee handler = handlers.get(entry.getHandledBy());
            Map<String, Object> row = new HashMap<>();
            row.put("historyId", entry.getHistoryId());
            row.put("fromStatus", entry.getFromStatus());
            row.put("toStatus", entry.getToStatus());
            row.put("note", entry.getNote());
            row.put("handledBy", entry.getHandledBy());
            row.put("handlerName", handler != null ? handler.getFullName() : null);
            row.put("handlerRole", entry.getHandlerRole());
            row.put("createdAt", entry.getCreatedAt());
            return row;
        }).collect(Collectors.toList());
    }

    /** Dữ liệu cũ: PROCESSING → REVIEWED, REJECTED → CLOSED. */
    private static String normalizeStatus(String status) {
        String value = status == null ? "PENDING" : status.toUpperCase();
        return switch (value) {
            case "PROCESSING" -> "REVIEWED";
            case "REJECTED" -> "CLOSED";
            default -> value;
        };
    }

    // ------------------------------------------------------------------ Đồng nghiệp

    /** Đồng nghiệp đang làm cùng cửa hàng (để chọn khi gửi phản hồi loại Đồng nghiệp). */
    public List<Map<String, Object>> colleagues() {
        Viewer viewer = viewer();
        Set<Integer> ids = colleagueIds(viewer);
        return employeeRepository.findAllById(ids).stream()
                .filter(employee -> "ACTIVE".equalsIgnoreCase(employee.getStatus()))
                .sorted(Comparator.comparing(Employee::getFullName, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(employee -> {
                    Map<String, Object> row = new HashMap<>();
                    row.put("employeeId", employee.getId());
                    row.put("fullName", employee.getFullName());
                    row.put("employeeCode", employee.getEmployeeCode());
                    return row;
                })
                .collect(Collectors.toList());
    }

    private Set<Integer> colleagueIds(Viewer viewer) {
        Set<Integer> storeIds = viewer.storeIds();
        Set<Integer> ids = new HashSet<>();
        employeeStoreRepository.findAll().stream()
                .filter(link -> "ACTIVE".equalsIgnoreCase(link.getStatus()))
                .filter(link -> storeIds == null || storeIds.contains(link.getStoreId()))
                .forEach(link -> ids.add(link.getEmployeeId()));
        storeManagerRepository.findAll().stream()
                .filter(link -> "ACTIVE".equalsIgnoreCase(link.getStatus()))
                .filter(link -> storeIds == null || storeIds.contains(link.getStoreId()))
                .forEach(link -> ids.add(link.getEmployeeId()));
        ids.remove(viewer.employeeId());
        return ids;
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
            view.put("status", normalizeStatus(item.getStatus()));
            view.put("nextStatuses", canHandle(item, viewer)
                    ? TRANSITIONS.getOrDefault(normalizeStatus(item.getStatus()), Set.of()).stream().sorted().toList()
                    : List.of());
            view.put("senderName", sender != null ? sender.getFullName() : null);
            view.put("senderCode", sender != null ? sender.getEmployeeCode() : null);
            view.put("handlerName", handler != null ? handler.getFullName() : null);
            view.put("targetEmployeeName", target != null ? target.getFullName() : null);
            view.put("storeName", stores.get(item.getStoreId()));
            view.put("shiftLabel", shiftLabel(shifts.get(item.getShiftByDateId())));
            view.put("attachmentIdList", splitIds(item.getAttachmentIds()));
            view.put("mine", isSender(item, viewer));
            view.put("canReply", canHandle(item, viewer));
            // Quản lý / admin xử lý phản hồi gửi tới trưởng cửa hàng = phản hồi thay
            view.put("handledOnBehalf", item.getHandlerRole() != null
                    && STORE_MANAGER.equals(targetOf(item))
                    && !STORE_MANAGER.equals(item.getHandlerRole()));
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
