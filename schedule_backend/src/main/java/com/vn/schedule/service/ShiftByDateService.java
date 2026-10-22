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
import com.vn.schedule.util.PageSupport;
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

@Service
public class ShiftByDateService {
    private final ShiftByDateRepository repository;
    private final ShiftRepository shiftRepository;
    private final SchedulePeriodRepository schedulePeriodRepository;
    private final ScheduleRoundRepository scheduleRoundRepository;
    private final ScheduleSessionRepository scheduleSessionRepository;
    private final StoreScopeService storeScopeService;

    public ShiftByDateService(ShiftByDateRepository repository, ShiftRepository shiftRepository,
                              SchedulePeriodRepository schedulePeriodRepository,
                              ScheduleRoundRepository scheduleRoundRepository,
                              ScheduleSessionRepository scheduleSessionRepository,
                              StoreScopeService storeScopeService) {
        this.repository = repository;
        this.shiftRepository = shiftRepository;
        this.schedulePeriodRepository = schedulePeriodRepository;
        this.scheduleRoundRepository = scheduleRoundRepository;
        this.scheduleSessionRepository = scheduleSessionRepository;
        this.storeScopeService = storeScopeService;
    }

    @Transactional(readOnly = true)
    public List<ShiftByDateResponse> findAll() {
        return findAll(null, null, null, null, null);
    }

    @Transactional(readOnly = true)
    public List<ShiftByDateResponse> findAll(String query, LocalDate from, LocalDate to,
                                             Integer storeId, String status) {
        if (SecurityUtil.getCurrentUserLogin().isEmpty()) return List.of();
        // ADMIN / MANAGER: mọi ca; STORE_MANAGER: ca của cửa hàng quản lý; còn lại: ca từng được phân
        String roleCode = storeScopeService.primaryRoleCode();
        boolean global = "MANAGER".equalsIgnoreCase(roleCode) || "ADMIN".equalsIgnoreCase(roleCode);
        boolean storeManager = "STORE_MANAGER".equalsIgnoreCase(roleCode);
        Set<Integer> storeIds = storeManager ? storeScopeService.visibleStoreIds() : null;
        Integer assignedEmployeeId = global || storeManager ? null : storeScopeService.currentEmployeeId();
        return repository.search(global || !storeManager, StoreScopeService.inParam(storeIds), assignedEmployeeId,
                        from, to, storeId,
                        status == null || status.isBlank() ? null : status,
                        PageSupport.keyword(query))
                .stream()
                .map(this::toResponse)
                .toList();
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
