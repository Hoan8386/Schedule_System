package com.vn.schedule.service;

import com.vn.schedule.domain.ShiftGroup;
import com.vn.schedule.domain.ShiftGroupEmployee;
import com.vn.schedule.repository.EmployeeStoreRepository;
import com.vn.schedule.repository.ShiftGroupEmployeeRepository;
import com.vn.schedule.repository.ShiftGroupRepository;
import com.vn.schedule.util.ApiException;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import static com.vn.schedule.util.SqlValues.*;

/** Gán nhân viên vào nhóm ca. Chỉ nhân viên đang làm việc tại cửa hàng của nhóm ca mới được gán. */
@Service
public class ShiftGroupMemberService {
    private final ShiftGroupRepository groupRepository;
    private final ShiftGroupEmployeeRepository memberRepository;
    private final EmployeeStoreRepository employeeStoreRepository;
    private final StoreScopeService storeScopeService;

    @PersistenceContext
    private EntityManager entityManager;

    public ShiftGroupMemberService(ShiftGroupRepository groupRepository, ShiftGroupEmployeeRepository memberRepository,
                                   EmployeeStoreRepository employeeStoreRepository, StoreScopeService storeScopeService) {
        this.groupRepository = groupRepository;
        this.memberRepository = memberRepository;
        this.employeeStoreRepository = employeeStoreRepository;
        this.storeScopeService = storeScopeService;
    }

    /** Thay toàn bộ danh sách thành viên của nhóm ca bằng employeeIds; trả về danh sách sau khi lưu. */
    @Transactional
    public List<Integer> replaceMembers(Integer shiftGroupId, Collection<Integer> employeeIds) {
        ShiftGroup group = groupRepository.findById(shiftGroupId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy nhóm ca"));
        Integer storeId = group.getStore().getId();
        storeScopeService.requireStoreAccess(storeId);

        Set<Integer> wanted = new LinkedHashSet<>(employeeIds == null ? List.of() : employeeIds);
        wanted.remove(null);

        Set<Integer> storeEmployees = employeeStoreRepository.findAll().stream()
                .filter(item -> storeId.equals(item.getStoreId()) && "ACTIVE".equalsIgnoreCase(item.getStatus()))
                .map(item -> item.getEmployeeId())
                .collect(Collectors.toSet());
        List<Integer> invalid = wanted.stream().filter(id -> !storeEmployees.contains(id)).toList();
        if (!invalid.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Nhân viên " + invalid + " không làm việc tại cửa hàng " + group.getStore().getStoreName());
        }

        Map<Integer, ShiftGroupEmployee> current = new HashMap<>();
        memberRepository.findByShiftGroupId(shiftGroupId).forEach(item -> current.put(item.getEmployeeId(), item));

        memberRepository.deleteAll(current.values().stream()
                .filter(item -> !wanted.contains(item.getEmployeeId()))
                .toList());
        Integer assignedBy = currentEmployeeIdOrNull();
        memberRepository.saveAll(wanted.stream()
                .filter(id -> !current.containsKey(id))
                .map(id -> new ShiftGroupEmployee(shiftGroupId, id, assignedBy))
                .toList());
        return new ArrayList<>(wanted);
    }

    // ------------------------------------------------------------------ Nhóm ca của nhân viên đang đăng nhập

    /** Ca mẫu của nhóm; maxCapacity là sức chứa mặc định khi chưa có ca theo ngày. */
    public record MyShift(Integer shiftId, String shiftCode, String shiftName, String startTime, String endTime, BigDecimal payRate,
                          Integer maxCapacity) {
    }

    public record MyGroup(Integer shiftGroupId, String shiftGroupCode, String shiftGroupName, String description,
                          Integer storeId, String storeName, List<MyShift> shifts) {
    }

    /**
     * Ca theo ngày của nhóm (mọi trạng thái; chỉ status = OPEN mới đăng ký được).
     * myAssignmentStatus = trạng thái đăng ký của chính nhân viên (null nếu chưa).
     */
    public record OpenShift(Integer shiftByDateId, Integer shiftId, Integer shiftGroupId, String shiftGroupName,
                            String workDate, String shiftName, String startTime, String endTime, String storeName,
                            long registeredCount, Integer maxCapacity, BigDecimal payRate, String myAssignmentStatus,
                            String status) {
    }

    /** Phiên đăng ký của một nhóm ca trong đợt. */
    public record RegistrationSession(Integer sessionId, String sessionName, Integer shiftGroupId, String shiftGroupName,
                                      String openAt, String closeAt, String status) {
    }

    /** Đợt đăng ký của cửa hàng; không có phiên = mọi nhóm ca đăng ký trong cả đợt. */
    public record RegistrationRound(Integer roundId, String roundName, String storeName, String registrationStartAt,
                                    String registrationEndAt, String status, List<RegistrationSession> sessions) {
    }

    /** Kỳ lịch đang mở (OPEN) kèm các đợt / phiên đăng ký liên quan tới nhân viên. */
    public record RegistrationPeriod(Integer periodId, String periodName, String periodType, String startDate, String endDate,
                                     String effectiveStartDate, String effectiveEndDate, String status,
                                     List<RegistrationRound> rounds) {
    }

    public record MyShiftGroups(String from, String to, List<MyGroup> groups, List<OpenShift> openShifts,
                                List<RegistrationPeriod> periods) {
    }

    /** Nhóm ca của nhân viên đang đăng nhập, ca mẫu của nhóm và các ca theo ngày đang mở đăng ký. */
    @Transactional(readOnly = true)
    public MyShiftGroups myShiftGroups(LocalDate from, LocalDate to) {
        Integer employeeId = storeScopeService.currentEmployeeId();
        LocalDate start = from != null ? from : LocalDate.now();
        LocalDate end = to != null ? to : start.plusDays(60);

        Map<Integer, List<MyShift>> shiftsByGroup = new LinkedHashMap<>();
        for (Object[] row : rows(entityManager, """
                SELECT sh.shift_group_id, sh.shift_id, sh.shift_code, sh.shift_name, sh.start_time, sh.end_time,
                       COALESCE(sh.pay_rate, sg.pay_rate, 0), sh.max_capacity
                FROM shift sh
                JOIN shift_group sg ON sg.shift_group_id = sh.shift_group_id
                JOIN shift_group_employee m ON m.shift_group_id = sh.shift_group_id AND m.employee_id = :employeeId
                WHERE sh.status = 'ACTIVE'
                ORDER BY sh.start_time
                """, Map.of("employeeId", employeeId))) {
            shiftsByGroup.computeIfAbsent(toInt(row[0]), key -> new ArrayList<>()).add(new MyShift(
                    toInt(row[1]), text(row[2]), text(row[3]), formatTime(toTime(row[4])), formatTime(toTime(row[5])),
                    money(toDecimal(row[6])), toInt(row[7])));
        }

        List<MyGroup> groups = rows(entityManager, """
                SELECT sg.shift_group_id, sg.shift_group_code, sg.shift_group_name, sg.description, st.store_id, st.store_name
                FROM shift_group_employee m
                JOIN shift_group sg ON sg.shift_group_id = m.shift_group_id
                JOIN store st ON st.store_id = sg.store_id
                WHERE m.employee_id = :employeeId AND sg.status = 'ACTIVE'
                ORDER BY st.store_name, sg.shift_group_name
                """, Map.of("employeeId", employeeId)).stream()
                .map(row -> new MyGroup(toInt(row[0]), text(row[1]), text(row[2]), text(row[3]), toInt(row[4]), text(row[5]),
                        shiftsByGroup.getOrDefault(toInt(row[0]), List.of())))
                .toList();

        List<OpenShift> openShifts = shiftsByDate(employeeId, start, end, null);

        return new MyShiftGroups(start.toString(), end.toString(), groups, openShifts, registrationPeriods(groups));
    }

    /**
     * Ca theo ngày thuộc các nhóm ca của nhân viên trong khoảng ngày (onlyId != null: chỉ một ca theo ngày).
     */
    public List<OpenShift> shiftsByDate(Integer employeeId, LocalDate from, LocalDate to, Integer onlyId) {
        Map<String, Object> params = new HashMap<>();
        params.put("employeeId", employeeId);
        params.put("from", from);
        params.put("to", to);
        String only = "";
        if (onlyId != null) {
            only = " AND sbd.shift_by_date_id = :onlyId";
            params.put("onlyId", onlyId);
        }
        return rows(entityManager, """
                SELECT sbd.shift_by_date_id, sh.shift_id, sg.shift_group_id, sg.shift_group_name, sbd.work_date,
                       COALESCE(sbd.shift_name, sh.shift_name),
                       COALESCE(sbd.start_time, sh.start_time), COALESCE(sbd.end_time, sh.end_time),
                       st.store_name,
                       (SELECT COUNT(*) FROM shift_assignment a
                        WHERE a.shift_by_date_id = sbd.shift_by_date_id AND a.status NOT IN ('CANCELLED', 'REJECTED')),
                       COALESCE(sbd.max_capacity, sh.max_capacity),
                       COALESCE(sbd.pay_rate, sh.pay_rate, sg.pay_rate, 0),
                       (SELECT a.status FROM shift_assignment a
                        WHERE a.shift_by_date_id = sbd.shift_by_date_id AND a.employee_id = :employeeId
                        ORDER BY a.assignment_id DESC LIMIT 1),
                       sbd.status
                FROM shift_by_date sbd
                JOIN shift sh ON sh.shift_id = sbd.shift_id
                JOIN shift_group sg ON sg.shift_group_id = sh.shift_group_id
                JOIN shift_group_employee m ON m.shift_group_id = sg.shift_group_id AND m.employee_id = :employeeId
                JOIN store st ON st.store_id = sh.store_id
                WHERE sbd.work_date BETWEEN :from AND :to
                """ + only + " ORDER BY sbd.work_date, COALESCE(sbd.start_time, sh.start_time)", params).stream()
                .map(row -> new OpenShift(toInt(row[0]), toInt(row[1]), toInt(row[2]), text(row[3]),
                        toDate(row[4]).toString(), text(row[5]), formatTime(toTime(row[6])), formatTime(toTime(row[7])),
                        text(row[8]), toLong(row[9]), toInt(row[10]), money(toDecimal(row[11])), text(row[12]), text(row[13])))
                .toList();
    }

    /**
     * Kỳ lịch đang mở (status = OPEN) có đợt đăng ký tại cửa hàng của các nhóm ca nhân viên thuộc về.
     * Chỉ lấy phiên dành cho nhóm của nhân viên (hoặc phiên không gắn nhóm).
     */
    private List<RegistrationPeriod> registrationPeriods(List<MyGroup> groups) {
        if (groups.isEmpty()) return List.of();
        List<Integer> storeIds = groups.stream().map(MyGroup::storeId).distinct().toList();
        List<Integer> groupIds = groups.stream().map(MyGroup::shiftGroupId).toList();

        List<Object[]> roundRows = rows(entityManager, """
                SELECT p.schedule_period_id, p.period_name, p.period_type, p.start_date, p.end_date,
                       p.effective_start_date, p.effective_end_date, p.status,
                       r.schedule_round_id, r.round_name, st.store_name, r.registration_start_at, r.registration_end_at, r.status
                FROM schedule_period p
                JOIN schedule_round r ON r.schedule_period_id = p.schedule_period_id
                LEFT JOIN store st ON st.store_id = r.store_id
                WHERE p.status = 'OPEN' AND r.status <> 'CLOSED'
                  AND (r.store_id IS NULL OR r.store_id IN (:storeIds))
                ORDER BY p.start_date, r.registration_start_at
                """, Map.of("storeIds", storeIds));
        if (roundRows.isEmpty()) return List.of();

        List<Integer> roundIds = roundRows.stream().map(row -> toInt(row[8])).toList();
        Map<Integer, List<RegistrationSession>> sessionsByRound = new HashMap<>();
        for (Object[] row : rows(entityManager, """
                SELECT s.schedule_round_id, s.schedule_session_id, s.session_name, s.shift_group_id, sg.shift_group_name,
                       s.session_open_at, s.session_close_at, s.status
                FROM schedule_session s
                LEFT JOIN shift_group sg ON sg.shift_group_id = s.shift_group_id
                WHERE s.schedule_round_id IN (:roundIds)
                  AND (s.shift_group_id IS NULL OR s.shift_group_id IN (:groupIds))
                ORDER BY s.session_open_at
                """, Map.of("roundIds", roundIds, "groupIds", groupIds))) {
            sessionsByRound.computeIfAbsent(toInt(row[0]), key -> new ArrayList<>()).add(new RegistrationSession(
                    toInt(row[1]), text(row[2]), toInt(row[3]), text(row[4]),
                    formatDateTime(row[5]), formatDateTime(row[6]), text(row[7])));
        }

        Map<Integer, RegistrationPeriod> periods = new LinkedHashMap<>();
        for (Object[] row : roundRows) {
            RegistrationPeriod period = periods.computeIfAbsent(toInt(row[0]), id -> new RegistrationPeriod(
                    id, text(row[1]), text(row[2]), dateText(row[3]), dateText(row[4]), dateText(row[5]), dateText(row[6]),
                    text(row[7]), new ArrayList<>()));
            Integer roundId = toInt(row[8]);
            period.rounds().add(new RegistrationRound(roundId, text(row[9]), text(row[10]),
                    formatDateTime(row[11]), formatDateTime(row[12]), text(row[13]),
                    sessionsByRound.getOrDefault(roundId, List.of())));
        }
        return new ArrayList<>(periods.values());
    }

    private static String dateText(Object value) {
        LocalDate date = toDate(value);
        return date == null ? null : date.toString();
    }

    /** Nhân viên có thuộc nhóm ca không. */
    @Transactional(readOnly = true)
    public boolean isMember(Integer shiftGroupId, Integer employeeId) {
        return memberRepository.existsByShiftGroupIdAndEmployeeId(shiftGroupId, employeeId);
    }

    /** employeeIds của từng nhóm ca, để trả kèm API danh sách nhóm ca. */
    @Transactional(readOnly = true)
    public Map<Integer, List<Integer>> memberIdsByGroup() {
        return memberRepository.findAll().stream()
                .collect(Collectors.groupingBy(ShiftGroupEmployee::getShiftGroupId,
                        Collectors.mapping(ShiftGroupEmployee::getEmployeeId, Collectors.toList())));
    }

    private Integer currentEmployeeIdOrNull() {
        try {
            return storeScopeService.currentEmployeeId();
        } catch (ApiException ex) {
            return null;
        }
    }
}
