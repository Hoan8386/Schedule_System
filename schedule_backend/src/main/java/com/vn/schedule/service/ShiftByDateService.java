package com.vn.schedule.service;

import com.vn.schedule.domain.ShiftByDate;
import com.vn.schedule.domain.SchedulePeriod;
import com.vn.schedule.domain.Shift;
import com.vn.schedule.domain.ScheduleRound;
import com.vn.schedule.domain.ScheduleSession;
import com.vn.schedule.repository.ScheduleRoundRepository;
import com.vn.schedule.repository.ScheduleSessionRepository;
import com.vn.schedule.repository.ShiftByDateRepository;
import com.vn.schedule.repository.SchedulePeriodRepository;
import com.vn.schedule.repository.ShiftRepository;
import com.vn.schedule.repository.UserRepository;
import com.vn.schedule.repository.UserRoleRepository;
import com.vn.schedule.repository.RoleRepository;
import com.vn.schedule.repository.EmployeeRepository;
import com.vn.schedule.repository.ShiftAssignmentRepository;
import com.vn.schedule.repository.StoreManagerRepository;
import com.vn.schedule.util.SecurityUtil;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.request.ShiftByDateRequest;
import com.vn.schedule.dto.response.ShiftByDateResponse;
import java.time.LocalTime;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ShiftByDateService {
    private final ShiftByDateRepository repository;
    private final ShiftRepository shiftRepository;
    private final SchedulePeriodRepository schedulePeriodRepository;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final RoleRepository roleRepository;
    private final EmployeeRepository employeeRepository;
    private final ShiftAssignmentRepository shiftAssignmentRepository;
    private final StoreManagerRepository storeManagerRepository;
    private final ScheduleRoundRepository scheduleRoundRepository;
    private final ScheduleSessionRepository scheduleSessionRepository;

    public ShiftByDateService(ShiftByDateRepository repository, ShiftRepository shiftRepository,
                              SchedulePeriodRepository schedulePeriodRepository,
                              UserRepository userRepository,
                              UserRoleRepository userRoleRepository,
                              RoleRepository roleRepository,
                              EmployeeRepository employeeRepository,
                              ShiftAssignmentRepository shiftAssignmentRepository,
                              StoreManagerRepository storeManagerRepository,
                              ScheduleRoundRepository scheduleRoundRepository,
                              ScheduleSessionRepository scheduleSessionRepository) {
        this.repository = repository;
        this.shiftRepository = shiftRepository;
        this.schedulePeriodRepository = schedulePeriodRepository;
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.roleRepository = roleRepository;
        this.employeeRepository = employeeRepository;
        this.shiftAssignmentRepository = shiftAssignmentRepository;
        this.storeManagerRepository = storeManagerRepository;
        this.scheduleRoundRepository = scheduleRoundRepository;
        this.scheduleSessionRepository = scheduleSessionRepository;
    }

    @Transactional(readOnly = true)
    public List<ShiftByDateResponse> findAll() {
        return findAll(null, null, null, null, null);
    }

    @Transactional(readOnly = true)
    public List<ShiftByDateResponse> findAll(String query, LocalDate from, LocalDate to,
                                             Integer storeId, String status) {
        Set<Integer> visibleIds = visibleShiftIds();
        String normalizedQuery = query == null ? "" : query.trim().toLowerCase();

        return repository.findAll().stream()
                .filter(item -> visibleIds == null || visibleIds.contains(item.getId()))
                .filter(item -> from == null || !item.getWorkDate().isBefore(from))
                .filter(item -> to == null || !item.getWorkDate().isAfter(to))
                .filter(item -> storeId == null || item.getShift().getStore().getId().equals(storeId))
                .filter(item -> status == null || status.isBlank()
                        || status.equalsIgnoreCase(item.getStatus()))
                .filter(item -> normalizedQuery.isBlank()
                        || contains(item.getShiftName(), normalizedQuery)
                        || contains(item.getShift().getShiftName(), normalizedQuery)
                        || contains(item.getShift().getShiftCode(), normalizedQuery))
                .map(this::toResponse)
                .toList();
    }

    private boolean contains(String value, String query) {
        return value != null && value.toLowerCase().contains(query);
    }

    private Set<Integer> visibleShiftIds() {
        String login = SecurityUtil.getCurrentUserLogin().orElse(null);
        if (login == null) return Set.of();

        var user = userRepository.findByUsername(login)
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

        Integer employeeId = employeeRepository.findByUser_Id(user.getId())
                .map(employee -> employee.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "Tài khoản chưa có hồ sơ nhân viên"));

        if ("STORE_MANAGER".equalsIgnoreCase(roleCode)) {
            Set<Integer> storeIds = storeManagerRepository.findByEmployeeIdAndStatus(employeeId, "ACTIVE")
                    .stream().map(item -> item.getStoreId()).collect(Collectors.toSet());
            return repository.findAll().stream()
                    .filter(item -> item.getShift() != null
                            && storeIds.contains(item.getShift().getStore().getId()))
                    .map(ShiftByDate::getId)
                    .collect(Collectors.toSet());
        }

        return shiftAssignmentRepository.findByEmployeeIdOrderByRegisteredAtDesc(employeeId)
                .stream()
                .map(assignment -> assignment.getShiftByDate().getId())
                .collect(Collectors.toSet());
    }

    public ShiftByDate findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional(readOnly = true)
    public ShiftByDateResponse findResponseById(Integer id) {
        return toResponse(findById(id));
    }

    @Transactional
    public ShiftByDateResponse create(ShiftByDateRequest body) {
        return toResponse(repository.save(toEntity(body)));
    }

    @Transactional
    public ShiftByDateResponse update(Integer id, ShiftByDateRequest body) {
        ShiftByDate current = findById(id);
        applyFields(current, body);
        return toResponse(repository.save(current));
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
        applyFields(entity, body);
        entity.setCreatedAt(LocalDateTime.now());
        return entity;
    }

    private void applyFields(ShiftByDate entity, ShiftByDateRequest body) {
        entity.setShift(resolveShift(body));
        entity.setScheduleRound(optionalReference(body.get("scheduleRound"), "scheduleRound", scheduleRoundRepository::getReferenceById));
        entity.setScheduleSession(optionalReference(body.get("scheduleSession"), "scheduleSession", scheduleSessionRepository::getReferenceById));
        SchedulePeriod period = resolveSchedulePeriod(body);
        // Ca theo ngày thuộc đợt; nếu không chọn kỳ thì lấy kỳ của đợt.
        if (period == null && entity.getScheduleRound() != null) {
            period = entity.getScheduleRound().getSchedulePeriod();
        }
        entity.setSchedulePeriod(period);
        entity.setWorkDate(parse(body.get("workDate"), "workDate", LocalDate::parse));
        entity.setCapacity(parse(body.get("capacity"), "capacity", Integer::valueOf));
        entity.setShiftName((String) body.get("shiftName"));
        entity.setStartTime(parse(body.get("startTime"), "startTime", LocalTime::parse));
        entity.setEndTime(parse(body.get("endTime"), "endTime", LocalTime::parse));
        entity.setMaxCapacity(parse(body.get("maxCapacity"), "maxCapacity", Integer::valueOf));
        entity.setPayRate(parse(body.get("payRate"), "payRate", BigDecimal::new));
        entity.setStatus((String) body.get("status"));
        entity.setManagerNote((String) body.get("managerNote"));
        entity.setUpdatedAt(LocalDateTime.now());
    }

    /** Nhận giá trị JSON (chuỗi hoặc số) và chuyển sang kiểu đích. */
    private <T> T parse(Object value, String fieldName, java.util.function.Function<String, T> parser) {
        if (value == null || (value instanceof String text && text.isBlank())) {
            return null;
        }
        try {
            return parser.apply(String.valueOf(value).trim());
        } catch (RuntimeException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, fieldName + " không hợp lệ: " + value);
        }
    }

    private <T> T optionalReference(Object value, String fieldName, java.util.function.Function<Integer, T> loader) {
        if (value == null || (value instanceof String text && text.isBlank())) {
            return null;
        }
        if (value instanceof String text) {
            return loader.apply(parse(text, fieldName, Integer::valueOf));
        }
        return loader.apply(requiredId(value, fieldName));
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

    private ShiftByDateResponse toResponse(ShiftByDate item) {
        Shift shift = item.getShift();
        SchedulePeriod period = item.getSchedulePeriod();
        ScheduleRound round = item.getScheduleRound();
        ScheduleSession session = item.getScheduleSession();
        return new ShiftByDateResponse(
                item.getId(),
                shift == null ? null : new ShiftByDateResponse.ShiftSummary(
                        shift.getId(),
                        shift.getShiftCode(),
                        shift.getShiftName(),
                        shift.getStartTime(),
                        shift.getEndTime(),
                        shift.getMaxCapacity(),
                        shift.getPayRate(),
                        shift.getStatus()),
                shift == null ? null : shift.getId(),
                period == null ? null : new ShiftByDateResponse.SchedulePeriodSummary(
                        period.getId(),
                        period.getPeriodName(),
                        period.getPeriodType(),
                        period.getStartDate(),
                        period.getEndDate(),
                        period.getStatus(),
                        period.getRegistrationOpenAt(),
                        period.getRegistrationCloseAt()),
                period == null ? null : period.getId(),
                round == null ? null : round.getId(),
                round == null ? null : round.getRoundName(),
                session == null ? null : session.getId(),
                session == null ? null : session.getSessionName(),
                item.getWorkDate(),
                item.getCapacity(),
                item.getShiftName(),
                item.getStartTime(),
                item.getEndTime(),
                item.getMaxCapacity(),
                item.getPayRate(),
                item.getStatus(),
                item.getManagerNote(),
                item.getCreatedAt(),
                item.getUpdatedAt());
    }
}
