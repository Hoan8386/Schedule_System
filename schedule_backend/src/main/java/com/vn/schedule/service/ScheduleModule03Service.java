package com.vn.schedule.service;

import com.vn.schedule.domain.*;
import com.vn.schedule.dto.request.*;
import com.vn.schedule.repository.*;
import com.vn.schedule.util.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ScheduleModule03Service {
    private final ScheduleRoundRepository roundRepository;
    private final ScheduleSessionRepository sessionRepository;
    private final ShiftGroupRepository groupRepository;
    private final StoreRepository storeRepository;
    private final SchedulePeriodRepository periodRepository;
    private final ShiftGroupEmployeeRepository groupMemberRepository;

    public ScheduleModule03Service(ScheduleRoundRepository roundRepository,
            ScheduleSessionRepository sessionRepository, ShiftGroupRepository groupRepository,
            StoreRepository storeRepository, SchedulePeriodRepository periodRepository,
            ShiftGroupEmployeeRepository groupMemberRepository) {
        this.roundRepository = roundRepository;
        this.sessionRepository = sessionRepository;
        this.groupRepository = groupRepository;
        this.storeRepository = storeRepository;
        this.periodRepository = periodRepository;
        this.groupMemberRepository = groupMemberRepository;
    }

    public List<ScheduleRound> rounds() { return roundRepository.findAll(); }
    public ScheduleRound round(Integer id) { return roundRepository.findById(id).orElseThrow(() -> notFound("đợt đăng ký")); }
    @Transactional public ScheduleRound createRound(ScheduleRoundRequest b) {
        ScheduleRound e = new ScheduleRound();
        applyRound(e, b);
        e.setCreatedAt(LocalDateTime.now());
        return roundRepository.save(e);
    }
    @Transactional public ScheduleRound updateRound(Integer id, ScheduleRoundRequest b) {
        ScheduleRound e = round(id); applyRound(e, b); return roundRepository.save(e);
    }
    @Transactional public void deleteRound(Integer id) { roundRepository.delete(round(id)); }
    private void applyRound(ScheduleRound e, ScheduleRoundRequest b) {
        e.setRoundName(requiredText(b.get("roundName"), "roundName"));
        e.setSchedulePeriod(periodRepository.getReferenceById(requiredInteger(b.get("schedulePeriodId"), "schedulePeriodId")));
        e.setStore(storeRepository.getReferenceById(requiredInteger(b.get("storeId"), "storeId")));
        e.setRegistrationStartAt(dateTime(b.get("registrationStartAt"), "registrationStartAt"));
        e.setRegistrationEndAt(endDateTime(b.get("registrationEndAt"), "registrationEndAt"));
        e.setDescription(text(b.get("description")));
        e.setStatus(status(b.get("status"), "OPEN", "CLOSED"));
        e.setCreatedBy(integer(b.get("createdBy"), "createdBy"));
        validateRange(e.getRegistrationStartAt(), e.getRegistrationEndAt(), "registration");
    }

    public List<ScheduleSession> sessions() { return sessionRepository.findAll(); }
    public ScheduleSession session(Integer id) { return sessionRepository.findById(id).orElseThrow(() -> notFound("phiên đăng ký")); }
    @Transactional public ScheduleSession createSession(ScheduleSessionRequest b) {
        ScheduleSession e = new ScheduleSession();
        applySession(e, b);
        e.setCreatedAt(LocalDateTime.now());
        return sessionRepository.save(e);
    }
    @Transactional public ScheduleSession updateSession(Integer id, ScheduleSessionRequest b) {
        ScheduleSession e = session(id); applySession(e, b); return sessionRepository.save(e);
    }
    @Transactional public void deleteSession(Integer id) { sessionRepository.delete(session(id)); }
    private void applySession(ScheduleSession e, ScheduleSessionRequest b) {
        e.setSessionName(requiredText(b.get("sessionName"), "sessionName"));
        e.setSessionOpenAt(dateTime(b.get("sessionOpenAt"), "sessionOpenAt"));
        e.setSessionCloseAt(endDateTime(b.get("sessionCloseAt"), "sessionCloseAt"));
        e.setScheduleRound(resolveRound(b.get("scheduleRoundId")));
        e.setShiftGroup(resolveGroup(b.get("shiftGroupId")));
        e.setDescription(text(b.get("description")));
        e.setStatus(status(b.get("status"), "OPEN", "PENDING", "CLOSED"));
        e.setCreatedBy(integer(b.get("createdBy"), "createdBy"));
        validateRange(e.getSessionOpenAt(), e.getSessionCloseAt(), "session");
    }

    public List<ShiftGroup> groups() { return groupRepository.findAll(); }
    public ShiftGroup group(Integer id) { return groupRepository.findById(id).orElseThrow(() -> notFound("nhóm ca")); }
    @Transactional public ShiftGroup createGroup(ShiftGroupRequest b) {
        ShiftGroup e = new ShiftGroup(); applyGroup(e, b); e.setCreatedAt(LocalDateTime.now()); return groupRepository.save(e);
    }
    @Transactional public ShiftGroup updateGroup(Integer id, ShiftGroupRequest b) {
        ShiftGroup e = group(id); applyGroup(e, b); e.setUpdatedAt(LocalDateTime.now()); return groupRepository.save(e);
    }
    @Transactional public void deleteGroup(Integer id) {
        ShiftGroup e = group(id);
        groupMemberRepository.deleteByShiftGroupId(id); // gỡ thành viên trước để không vướng khóa ngoại
        groupRepository.delete(e);
    }
    private void applyGroup(ShiftGroup e, ShiftGroupRequest b) {
        e.setStore(storeRepository.getReferenceById(requiredInteger(b.get("storeId"), "storeId")));
        e.setShiftGroupCode(requiredText(b.get("shiftGroupCode"), "shiftGroupCode"));
        e.setShiftGroupName(requiredText(b.get("shiftGroupName"), "shiftGroupName"));
        e.setDescription(text(b.get("description")));
        e.setPayRate(decimal(b.get("payRate"), "payRate"));
        e.setStatus(status(b.get("status"), "ACTIVE", "INACTIVE"));
        e.setCreatedBy(integer(b.get("createdBy"), "createdBy"));
    }

    private ScheduleRound resolveRound(Object value) {
        if (value == null || (value instanceof String s && s.isBlank())) return null;
        return roundRepository.getReferenceById(requiredInteger(value, "scheduleRoundId"));
    }
    private ShiftGroup resolveGroup(Object value) {
        if (value == null || (value instanceof String s && s.isBlank())) return null;
        return groupRepository.getReferenceById(requiredInteger(value, "shiftGroupId"));
    }
    private String requiredText(Object value, String field) {
        String result = text(value); if (result == null || result.isBlank()) throw bad(field + " là bắt buộc"); return result.trim();
    }
    private String text(Object value) { return value == null ? null : String.valueOf(value); }
    private String status(Object value, String... allowed) {
        String result = requiredText(value, "status").toUpperCase();
        for (String item : allowed) if (item.equals(result)) return result;
        throw bad("status phải là một trong: " + String.join(", ", allowed));
    }
    private Integer integer(Object value, String field) {
        if (value == null || (value instanceof String s && s.isBlank())) return null;
        return requiredInteger(value, field);
    }
    private Integer requiredInteger(Object value, String field) {
        try { return value instanceof Number n ? n.intValue() : Integer.valueOf(String.valueOf(value).trim()); }
        catch (RuntimeException ex) { throw bad(field + " phải là số nguyên"); }
    }
    /** Nhận ngày giờ ISO hoặc chỉ ngày (yyyy-MM-dd = 00:00 của ngày đó). */
    private LocalDateTime dateTime(Object value, String field) {
        if (value == null || (value instanceof String s && s.isBlank())) return null;
        if (value instanceof LocalDateTime dateTime) return dateTime;
        String text = String.valueOf(value).trim();
        try {
            return text.length() == 10 ? java.time.LocalDate.parse(text).atStartOfDay() : LocalDateTime.parse(text);
        } catch (RuntimeException ex) { throw bad(field + " phải theo định dạng ngày yyyy-MM-dd"); }
    }
    /** Mốc kết thúc nhập theo ngày (yyyy-MM-dd) nghĩa là hết ngày đó (23:59:59). */
    private LocalDateTime endDateTime(Object value, String field) {
        LocalDateTime result = dateTime(value, field);
        if (result != null && value instanceof String text && text.trim().length() == 10) return result.toLocalDate().atTime(23, 59, 59);
        return result;
    }
    private BigDecimal decimal(Object value, String field) {
        if (value == null || (value instanceof String s && s.isBlank())) return null;
        try { return value instanceof BigDecimal d ? d : new BigDecimal(String.valueOf(value).trim()); }
        catch (RuntimeException ex) { throw bad(field + " phải là số thập phân"); }
    }
    private void validateRange(LocalDateTime start, LocalDateTime end, String field) {
        if (start != null && end != null && end.isBefore(start)) throw bad(field + " kết thúc không được trước thời điểm bắt đầu");
    }
    private ApiException bad(String message) { return new ApiException(HttpStatus.BAD_REQUEST, message); }
    private ApiException notFound(String resource) { return new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy " + resource); }
}
