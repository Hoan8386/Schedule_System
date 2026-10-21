package com.vn.schedule.service;

import com.vn.schedule.domain.SchedulePeriod;
import com.vn.schedule.domain.User;
import com.vn.schedule.domain.Employee;
import com.vn.schedule.repository.EmployeeRepository;
import com.vn.schedule.repository.EmployeeStoreRepository;
import com.vn.schedule.repository.SchedulePeriodRepository;
import com.vn.schedule.repository.StoreManagerRepository;
import com.vn.schedule.repository.UserRepository;
import com.vn.schedule.repository.UserRoleRepository;
import com.vn.schedule.repository.RoleRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.util.SecurityUtil;
import com.vn.schedule.dto.request.SchedulePeriodRequest;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SchedulePeriodService {
    private final SchedulePeriodRepository repository;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final RoleRepository roleRepository;
    private final EmployeeRepository employeeRepository;
    private final EmployeeStoreRepository employeeStoreRepository;
    private final StoreManagerRepository storeManagerRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public SchedulePeriodService(SchedulePeriodRepository repository,
                                UserRepository userRepository, UserRoleRepository userRoleRepository,
                                RoleRepository roleRepository, EmployeeRepository employeeRepository,
                                EmployeeStoreRepository employeeStoreRepository,
                                StoreManagerRepository storeManagerRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.roleRepository = roleRepository;
        this.employeeRepository = employeeRepository;
        this.employeeStoreRepository = employeeStoreRepository;
        this.storeManagerRepository = storeManagerRepository;
    }

    public List<SchedulePeriod> findAll() {
        return findAll(null, null, null, null, null);
    }

    public List<SchedulePeriod> findAll(String q, LocalDate from, LocalDate to, Integer storeId, String status) {
        String normalizedQuery = q == null ? "" : q.trim().toLowerCase();

        return repository.findAll().stream()
                .filter(item -> from == null || !item.getStartDate().isBefore(from))
                .filter(item -> to == null || !item.getEndDate().isAfter(to))
                .filter(item -> status == null || status.isBlank() || status.equalsIgnoreCase(item.getStatus()))
                .filter(item -> normalizedQuery.isBlank()
                        || contains(item.getPeriodName(), normalizedQuery)
                        || contains(item.getPeriodType(), normalizedQuery))
                .toList();
    }

    private boolean contains(String value, String query) {
        return value != null && value.toLowerCase().contains(query);
    }

    private Set<Integer> visibleStoreIds() {
        String login = SecurityUtil.getCurrentUserLogin().orElse(null);
        if (login == null) return Set.of();

        User user = userRepository.findByUsername(login)
                .or(() -> userRepository.findByEmail(login))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Tài khoản không tồn tại"));

        String roleCode = userRoleRepository.findByUserId(user.getId()).stream()
                .map(userRole -> roleRepository.findById(userRole.getRoleId()).orElse(null))
                .filter(java.util.Objects::nonNull)
                .map(role -> role.getRoleCode())
                .findFirst()
                .orElse("");

        if ("MANAGER".equalsIgnoreCase(roleCode) || "ADMIN".equalsIgnoreCase(roleCode)) {
            return null;
        }

        Employee employee = employeeRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "Tài khoản chưa có hồ sơ nhân viên"));

        if ("STORE_MANAGER".equalsIgnoreCase(roleCode)) {
            return storeManagerRepository.findByEmployeeIdAndStatus(employee.getId(), "ACTIVE").stream()
                    .map(item -> item.getStoreId())
                    .collect(Collectors.toSet());
        }

        return employeeStoreRepository.findByEmployeeIdAndStatus(employee.getId(), "ACTIVE").stream()
                .map(item -> item.getStoreId())
                .collect(Collectors.toSet());
    }

    public SchedulePeriod findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public SchedulePeriod create(SchedulePeriodRequest body) {
        SchedulePeriod entity = toEntity(body);
        entity.setId(null);
        if (entity.getPeriodType() == null || entity.getPeriodType().isBlank()) entity.setPeriodType(derivePeriodType(entity));
        entity.setCreatedAt(LocalDateTime.now());
        if (entity.getCreatedBy() == null) entity.setCreatedBy(currentEmployeeIdOrNull());
        SchedulePeriod saved = repository.saveAndFlush(entity);
        syncRegistrationRounds(saved);
        return saved;
    }

    @Transactional
    public SchedulePeriod update(Integer id, SchedulePeriodRequest body) {
        SchedulePeriod current = findById(id);
        applyFields(current, body);
        if (!body.values().containsKey("periodType")) current.setPeriodType(derivePeriodType(current));
        SchedulePeriod saved = repository.saveAndFlush(current);
        syncRegistrationRounds(saved);
        return saved;
    }

    /** Đánh dấu đợt đăng ký được tạo tự động từ thời gian Mở / Đóng đăng ký của kỳ. */
    private static final String AUTO_ROUND_NOTE = "Tự động tạo từ thời gian Mở / Đóng đăng ký của kỳ";

    /**
     * Thời gian Mở / Đóng đăng ký của kỳ chính là đợt đăng ký cho toàn bộ cửa hàng:
     * mỗi cửa hàng đang hoạt động có một đợt (tạo mới nếu chưa có), các đợt tự động đã có thì cập nhật theo kỳ.
     * Đợt do quản lý tự tạo (không có ghi chú tự động) không bị thay đổi.
     */
    private void syncRegistrationRounds(SchedulePeriod period) {
        LocalDateTime openAt = period.getRegistrationOpenAt();
        LocalDateTime closeAt = period.getRegistrationCloseAt();
        if (openAt == null && closeAt == null) return;
        if (openAt == null || closeAt == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cần nhập cả thời gian Mở đăng ký và Đóng đăng ký");
        }
        if (!closeAt.isAfter(openAt)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Thời gian Đóng đăng ký phải sau thời gian Mở đăng ký");
        }

        Map<Integer, Integer> autoRoundByStore = new LinkedHashMap<>();
        for (Object row : entityManager.createNativeQuery("""
                SELECT schedule_round_id, store_id FROM schedule_round
                WHERE schedule_period_id = :periodId AND description = :note
                """).setParameter("periodId", period.getId()).setParameter("note", AUTO_ROUND_NOTE).getResultList()) {
            Object[] values = (Object[]) row;
            autoRoundByStore.put(values[1] == null ? null : ((Number) values[1]).intValue(), ((Number) values[0]).intValue());
        }

        Integer createdBy = currentEmployeeIdOrNull();
        for (Object row : entityManager.createNativeQuery(
                "SELECT store_id, store_name FROM store WHERE status IN ('OPENING', 'ACTIVE') ORDER BY store_name").getResultList()) {
            Object[] store = (Object[]) row;
            Integer storeId = ((Number) store[0]).intValue();
            String roundName = "ĐK " + period.getPeriodName() + " · " + store[1];
            Integer roundId = autoRoundByStore.get(storeId);
            if (roundId != null) {
                entityManager.createNativeQuery("""
                        UPDATE schedule_round
                        SET round_name = :name, registration_start_at = :openAt, registration_end_at = :closeAt
                        WHERE schedule_round_id = :id
                        """)
                        .setParameter("name", roundName).setParameter("openAt", openAt).setParameter("closeAt", closeAt)
                        .setParameter("id", roundId).executeUpdate();
            } else {
                entityManager.createNativeQuery("""
                        INSERT INTO schedule_round (round_name, schedule_period_id, store_id, registration_start_at,
                                                    registration_end_at, description, status, created_by, created_at)
                        VALUES (:name, :periodId, :storeId, :openAt, :closeAt, :note, 'OPEN', :createdBy, :now)
                        """)
                        .setParameter("name", roundName).setParameter("periodId", period.getId()).setParameter("storeId", storeId)
                        .setParameter("openAt", openAt).setParameter("closeAt", closeAt).setParameter("note", AUTO_ROUND_NOTE)
                        .setParameter("createdBy", createdBy).setParameter("now", LocalDateTime.now()).executeUpdate();
            }
        }
    }

    private Integer currentEmployeeIdOrNull() {
        String login = SecurityUtil.getCurrentUserLogin().orElse(null);
        if (login == null) return null;
        return userRepository.findByUsername(login)
                .or(() -> userRepository.findByEmail(login))
                .flatMap(user -> employeeRepository.findByUser_Id(user.getId()))
                .map(Employee::getId)
                .orElse(null);
    }

    /** Số bản ghi sẽ bị xóa cùng kỳ, để frontend hiển thị cảnh báo trước khi xóa. */
    @Transactional(readOnly = true)
    public Map<String, Long> deletePreview(Integer id) {
        findById(id);
        Related related = collectRelated(id);
        Map<String, Long> result = new LinkedHashMap<>();
        result.put("rounds", (long) related.roundIds().size());
        result.put("sessions", (long) related.sessionIds().size());
        result.put("shiftByDates", (long) related.shiftByDateIds().size());
        result.put("assignments", (long) related.assignmentIds().size());
        result.put("attendances", (long) related.attendanceIds().size());
        result.put("emergencyRequests", (long) emergencyRequestIds(related).size());
        result.put("eventScopes", (long) eventScopeIds(id, related).size());
        return result;
    }

    /**
     * Xóa kỳ cùng toàn bộ dữ liệu lịch phụ thuộc: đợt, phiên, ca theo ngày, phân ca,
     * chấm công, yêu cầu khẩn và phạm vi sự kiện. Vi phạm, chi tiết lương, đánh giá
     * và phản hồi được giữ lại, chỉ bỏ liên kết tới ca/chấm công đã xóa.
     */
    @Transactional
    public void delete(Integer id) {
        findById(id);
        Related related = collectRelated(id);
        List<Integer> shiftByDateIds = related.shiftByDateIds();
        List<Integer> attendanceIds = related.attendanceIds();

        executeIn("UPDATE violation SET attendance_id = NULL WHERE attendance_id IN (:ids)", attendanceIds);
        executeIn("UPDATE payroll_detail SET attendance_id = NULL WHERE attendance_id IN (:ids)", attendanceIds);
        executeIn("UPDATE payroll_detail SET shift_by_date_id = NULL WHERE shift_by_date_id IN (:ids)", shiftByDateIds);
        executeIn("UPDATE employee_evaluation SET shift_by_date_id = NULL WHERE shift_by_date_id IN (:ids)", shiftByDateIds);
        executeIn("UPDATE feedback SET shift_by_date_id = NULL WHERE shift_by_date_id IN (:ids)", shiftByDateIds);

        executeIn("DELETE FROM emergency_request WHERE emergency_request_id IN (:ids)", emergencyRequestIds(related));
        executeIn("DELETE FROM event_scope WHERE event_scope_id IN (:ids)", eventScopeIds(id, related));
        executeIn("DELETE FROM attendance WHERE attendance_id IN (:ids)", attendanceIds);
        executeIn("DELETE FROM shift_assignment WHERE assignment_id IN (:ids)", related.assignmentIds());
        executeIn("DELETE FROM shift_by_date WHERE shift_by_date_id IN (:ids)", shiftByDateIds);
        executeIn("DELETE FROM schedule_session WHERE schedule_session_id IN (:ids)", related.sessionIds());
        executeIn("DELETE FROM schedule_round WHERE schedule_round_id IN (:ids)", related.roundIds());
        executeIn("DELETE FROM schedule_period WHERE schedule_period_id IN (:ids)", List.of(id));
        entityManager.clear();
    }

    private record Related(List<Integer> roundIds, List<Integer> sessionIds, List<Integer> shiftByDateIds,
                           List<Integer> assignmentIds, List<Integer> attendanceIds) {
    }

    private Related collectRelated(Integer periodId) {
        List<Integer> periodIds = List.of(periodId);
        List<Integer> roundIds = selectIn(
                "SELECT schedule_round_id FROM schedule_round WHERE schedule_period_id IN (:ids)", periodIds);
        List<Integer> sessionIds = selectIn(
                "SELECT schedule_session_id FROM schedule_session WHERE schedule_round_id IN (:ids)", roundIds);

        Set<Integer> shiftByDateIds = new LinkedHashSet<>();
        shiftByDateIds.addAll(selectIn("SELECT shift_by_date_id FROM shift_by_date WHERE schedule_period_id IN (:ids)", periodIds));
        shiftByDateIds.addAll(selectIn("SELECT shift_by_date_id FROM shift_by_date WHERE schedule_round_id IN (:ids)", roundIds));
        shiftByDateIds.addAll(selectIn("SELECT shift_by_date_id FROM shift_by_date WHERE schedule_session_id IN (:ids)", sessionIds));
        List<Integer> shiftByDates = List.copyOf(shiftByDateIds);

        return new Related(roundIds, sessionIds, shiftByDates,
                selectIn("SELECT assignment_id FROM shift_assignment WHERE shift_by_date_id IN (:ids)", shiftByDates),
                selectIn("SELECT attendance_id FROM attendance WHERE shift_by_date_id IN (:ids)", shiftByDates));
    }

    private List<Integer> emergencyRequestIds(Related related) {
        Set<Integer> ids = new HashSet<>(selectIn(
                "SELECT emergency_request_id FROM emergency_request WHERE assignment_id IN (:ids)", related.assignmentIds()));
        ids.addAll(selectIn("SELECT emergency_request_id FROM emergency_request "
                + "WHERE from_shift_assignment_id IN (:ids) OR to_assignment_id IN (:ids)", related.shiftByDateIds()));
        return List.copyOf(ids);
    }

    private List<Integer> eventScopeIds(Integer periodId, Related related) {
        Set<Integer> ids = new HashSet<>(selectIn(
                "SELECT event_scope_id FROM event_scope WHERE schedule_period_id IN (:ids)", List.of(periodId)));
        ids.addAll(selectIn("SELECT event_scope_id FROM event_scope WHERE shift_by_date_id IN (:ids)", related.shiftByDateIds()));
        return List.copyOf(ids);
    }

    private List<Integer> selectIn(String sql, Collection<Integer> values) {
        if (values.isEmpty()) return List.of();
        Query query = entityManager.createNativeQuery(sql).setParameter("ids", values);
        return ((List<?>) query.getResultList()).stream()
                .map(value -> ((Number) value).intValue())
                .toList();
    }

    private void executeIn(String sql, Collection<Integer> values) {
        if (values.isEmpty()) return;
        entityManager.createNativeQuery(sql).setParameter("ids", values).executeUpdate();
    }

    @Transactional
    public SchedulePeriod save(SchedulePeriodRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(SchedulePeriodRequest body) {
        repository.delete(toEntity(body));
    }
    private SchedulePeriod toEntity(SchedulePeriodRequest body) {
        SchedulePeriod entity = new SchedulePeriod();
        entity.setId(asInteger(body.get("id"), "id"));
        entity.setPeriodName(asString(body.get("periodName"), "periodName"));
        entity.setPeriodType(asString(body.get("periodType"), "periodType"));
        entity.setStartDate(parseLocalDate(body.get("startDate"), "startDate"));
        entity.setEndDate(parseLocalDate(body.get("endDate"), "endDate"));
        entity.setEffectiveStartDate(parseLocalDate(body.get("effectiveStartDate"), "effectiveStartDate"));
        entity.setEffectiveEndDate(parseLocalDate(body.get("effectiveEndDate"), "effectiveEndDate"));
        entity.setDescription(asString(body.get("description"), "description"));
        entity.setRegistrationOpenAt(parseLocalDateTime(body.get("registrationOpenAt"), "registrationOpenAt"));
        entity.setRegistrationCloseAt(parseCloseDateTime(body.get("registrationCloseAt")));
        entity.setStatus(asStatus(body.get("status")));
        entity.setCreatedBy(asInteger(body.get("createdBy"), "createdBy"));
        entity.setFinalizedBy(asInteger(body.get("finalizedBy"), "finalizedBy"));
        entity.setFinalizedAt(parseLocalDateTime(body.get("finalizedAt"), "finalizedAt"));
        return entity;
    }

    /**
     * Cập nhật một phần: chỉ ghi các trường có trong body (form bỏ trường rỗng),
     * không bao giờ đổi khóa chính của bản ghi đang sửa.
     */
    private void applyFields(SchedulePeriod entity, SchedulePeriodRequest body) {
        Map<String, Object> values = body.values();
        if (values.containsKey("periodName")) entity.setPeriodName(asString(body.get("periodName"), "periodName"));
        if (values.containsKey("periodType")) entity.setPeriodType(asString(body.get("periodType"), "periodType"));
        if (values.containsKey("startDate")) entity.setStartDate(parseLocalDate(body.get("startDate"), "startDate"));
        if (values.containsKey("endDate")) entity.setEndDate(parseLocalDate(body.get("endDate"), "endDate"));
        if (values.containsKey("effectiveStartDate")) {
            entity.setEffectiveStartDate(parseLocalDate(body.get("effectiveStartDate"), "effectiveStartDate"));
        }
        if (values.containsKey("effectiveEndDate")) {
            entity.setEffectiveEndDate(parseLocalDate(body.get("effectiveEndDate"), "effectiveEndDate"));
        }
        if (values.containsKey("description")) entity.setDescription(asString(body.get("description"), "description"));
        if (values.containsKey("registrationOpenAt")) {
            entity.setRegistrationOpenAt(parseLocalDateTime(body.get("registrationOpenAt"), "registrationOpenAt"));
        }
        if (values.containsKey("registrationCloseAt")) {
            entity.setRegistrationCloseAt(parseCloseDateTime(body.get("registrationCloseAt")));
        }
        if (values.containsKey("status")) entity.setStatus(asStatus(body.get("status")));
        if (values.containsKey("createdBy")) entity.setCreatedBy(asInteger(body.get("createdBy"), "createdBy"));
        if (values.containsKey("finalizedBy")) entity.setFinalizedBy(asInteger(body.get("finalizedBy"), "finalizedBy"));
        if (values.containsKey("finalizedAt")) entity.setFinalizedAt(parseLocalDateTime(body.get("finalizedAt"), "finalizedAt"));
    }

    /** Trạng thái kỳ lịch hợp lệ. */
    private static final Set<String> PERIOD_STATUSES = Set.of("DRAFT", "OPEN", "CANCELLED", "FINALIZED");

    private String asStatus(Object value) {
        String status = asString(value, "status");
        if (status == null || status.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Trạng thái kỳ không được để trống");
        }
        String normalized = status.trim().toUpperCase();
        if (!PERIOD_STATUSES.contains(normalized)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Trạng thái kỳ chỉ nhận DRAFT / OPEN / CANCELLED / FINALIZED");
        }
        return normalized;
    }

    private String asString(Object value, String fieldName) {
        if (value == null) {
            return null;
        }
        if (value instanceof String text) {
            return text;
        }
        throw new ApiException(HttpStatus.BAD_REQUEST, fieldName + " phải là chuỗi");
    }

    private Integer asInteger(Object value, String fieldName) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.intValue();
        }
        if (value instanceof String text && !text.isBlank()) {
            try {
                return Integer.parseInt(text.trim());
            } catch (NumberFormatException ex) {
                throw new ApiException(HttpStatus.BAD_REQUEST, fieldName + " không hợp lệ");
            }
        }
        throw new ApiException(HttpStatus.BAD_REQUEST, fieldName + " không hợp lệ");
    }

    private LocalDate parseLocalDate(Object value, String fieldName) {
        if (value == null) {
            return null;
        }
        if (value instanceof LocalDate localDate) {
            return localDate;
        }
        if (value instanceof String text) {
            String trimmed = text.trim();
            if (trimmed.isEmpty()) {
                return null;
            }
            try {
                return LocalDate.parse(trimmed);
            } catch (DateTimeParseException ex) {
                throw new ApiException(HttpStatus.BAD_REQUEST, fieldName + " không hợp lệ: " + trimmed);
            }
        }
        throw new ApiException(HttpStatus.BAD_REQUEST, fieldName + " phải là kiểu ngày");
    }

    /** Đóng đăng ký nhập theo ngày (yyyy-MM-dd) nghĩa là hết ngày đó (23:59:59). */
    private LocalDateTime parseCloseDateTime(Object value) {
        LocalDateTime result = parseLocalDateTime(value, "registrationCloseAt");
        if (result != null && value instanceof String text && text.trim().length() == 10) {
            return result.toLocalDate().atTime(23, 59, 59);
        }
        return result;
    }

    /** Loại kỳ không còn nhập trên form: kỳ áp dụng tối đa 7 ngày là WEEK, dài hơn là MONTH. */
    private static String derivePeriodType(SchedulePeriod entity) {
        LocalDate start = entity.getEffectiveStartDate() != null ? entity.getEffectiveStartDate() : entity.getStartDate();
        LocalDate end = entity.getEffectiveEndDate() != null ? entity.getEffectiveEndDate() : entity.getEndDate();
        if (start == null || end == null) return "MONTH";
        return java.time.temporal.ChronoUnit.DAYS.between(start, end) <= 6 ? "WEEK" : "MONTH";
    }

    private LocalDateTime parseLocalDateTime(Object value, String fieldName) {
        if (value == null) {
            return null;
        }
        if (value instanceof LocalDateTime localDateTime) {
            return localDateTime;
        }
        if (value instanceof String text) {
            String trimmed = text.trim();
            if (trimmed.isEmpty()) {
                return null;
            }
            try {
                return LocalDateTime.parse(trimmed);
            } catch (DateTimeParseException ex) {
                try {
                    return LocalDate.parse(trimmed).atStartOfDay();
                } catch (DateTimeParseException inner) {
                    throw new ApiException(HttpStatus.BAD_REQUEST, fieldName + " không hợp lệ: " + trimmed);
                }
            }
        }
        throw new ApiException(HttpStatus.BAD_REQUEST, fieldName + " phải là kiểu ngày giờ");
    }

}
