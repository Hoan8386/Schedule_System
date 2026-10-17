package com.vn.schedule.service;

import com.vn.schedule.dto.response.DashboardResponse.AttendanceDay;
import com.vn.schedule.dto.response.DashboardResponse.NotificationItem;
import com.vn.schedule.dto.response.DashboardResponse.RequestItem;
import com.vn.schedule.dto.response.DashboardResponse.RoundItem;
import com.vn.schedule.dto.response.DashboardResponse.ShiftItem;
import com.vn.schedule.dto.response.DashboardResponse.TodoItem;
import com.vn.schedule.dto.response.DashboardResponse.ViolationItem;
import com.vn.schedule.dto.response.DashboardResponse;
import com.vn.schedule.dto.response.StatisticsResponse.Overview;
import com.vn.schedule.dto.response.StatisticsResponse.Personal;
import com.vn.schedule.dto.response.StatisticsResponse.ShiftRow;
import com.vn.schedule.dto.response.StatisticsResponse.StoreOption;
import com.vn.schedule.util.ApiException;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static com.vn.schedule.util.SqlValues.*;

/** Số liệu cho trang tổng quan theo vai trò; phần thống kê tháng dùng chung StatisticsService. */
@Service
public class DashboardService {
    private static final int LIST_LIMIT = 5;
    private static final Set<String> ACTIVE_SHIFT = Set.of("UPCOMING", "IN_PROGRESS");

    private final StatisticsService statisticsService;
    private final StoreScopeService storeScopeService;

    @PersistenceContext
    private EntityManager entityManager;

    public DashboardService(StatisticsService statisticsService, StoreScopeService storeScopeService) {
        this.statisticsService = statisticsService;
        this.storeScopeService = storeScopeService;
    }

    // ------------------------------------------------------------------ API

    @Transactional(readOnly = true)
    public DashboardResponse.Manager manager() {
        LocalDate today = LocalDate.now();
        LocalDate monthStart = today.withDayOfMonth(1);
        LocalDate monthEnd = today.withDayOfMonth(today.lengthOfMonth());
        Overview month = statisticsService.managerOverview(monthStart, monthEnd, null);

        Map<String, Long> requestStatus = new LinkedHashMap<>();
        for (Object[] row : rows(entityManager, """
                SELECT status, COUNT(*) FROM emergency_request
                WHERE requested_at >= :from AND requested_at < :to
                GROUP BY status
                """, Map.of("from", monthStart.atStartOfDay(), "to", monthEnd.plusDays(1).atStartOfDay()))) {
            requestStatus.put(text(row[0]), toLong(row[1]));
        }

        return new DashboardResponse.Manager(
                monthStart.toString(), monthEnd.toString(),
                count(entityManager, "SELECT COUNT(*) FROM store WHERE status = 'ACTIVE'", Map.of()),
                count(entityManager, "SELECT COUNT(*) FROM store", Map.of()),
                count(entityManager, "SELECT COUNT(*) FROM employee WHERE status = 'ACTIVE'", Map.of()),
                todayShifts(today, null),
                countPendingRegistrations(today, null),
                countPendingRequests(null, null),
                month.summary(),
                attendanceTrend(today, null),
                requestStatus,
                month.byStore(),
                emergencyRequests(null, null, false, LIST_LIMIT),
                recentViolations(),
                count(entityManager, "SELECT COUNT(*) FROM violation WHERE violation_time >= :since",
                        Map.of("since", today.minusDays(6).atStartOfDay())),
                todos(currentEmployeeIdOrNull()));
    }

    @Transactional(readOnly = true)
    public DashboardResponse.StoreManager storeManager() {
        LocalDate today = LocalDate.now();
        LocalDate monthStart = today.withDayOfMonth(1);
        LocalDate monthEnd = today.withDayOfMonth(today.lengthOfMonth());
        Overview month = statisticsService.storeManagerOverview(monthStart, monthEnd, null);
        List<Integer> storeIds = month.stores().stream().map(StoreOption::storeId).toList();
        Integer employeeId = currentEmployeeIdOrNull();

        List<RequestItem> queue = new ArrayList<>(pendingRegistrations(today, storeIds, null, LIST_LIMIT));
        queue.addAll(emergencyRequests(storeIds, null, true, LIST_LIMIT));
        queue.sort(Comparator.comparing(RequestItem::workDate, Comparator.nullsLast(Comparator.<String>naturalOrder())));

        return new DashboardResponse.StoreManager(
                monthStart.toString(), monthEnd.toString(),
                employeeName(employeeId),
                month.stores(),
                month.summary(),
                todayShifts(today, storeIds),
                countPendingRegistrations(today, storeIds),
                countPendingRequests(storeIds, "CHANGE"),
                countPendingRequests(storeIds, "CANCEL"),
                queue.subList(0, Math.min(LIST_LIMIT, queue.size())),
                employeeId == null ? null : nextShift(employeeId, today),
                todos(employeeId),
                openRounds(storeIds),
                attendanceTrend(today, storeIds));
    }

    @Transactional(readOnly = true)
    public DashboardResponse.Employee employee() {
        LocalDate today = LocalDate.now();
        LocalDate monthStart = today.withDayOfMonth(1);
        LocalDate monthEnd = today.withDayOfMonth(today.lengthOfMonth());
        Integer employeeId = storeScopeService.currentEmployeeId();
        Personal month = statisticsService.personal(monthStart, monthEnd, null);

        LocalDate weekStart = today.with(DayOfWeek.MONDAY);
        List<ShiftItem> weekShifts = statisticsService.loadShifts(weekStart, weekStart.plusDays(6), null, employeeId).stream()
                .filter(row -> !"CANCELLED".equals(row.workStatus()))
                .map(DashboardService::shiftItem)
                .toList();

        List<RequestItem> pending = new ArrayList<>(pendingRegistrations(today, null, employeeId, LIST_LIMIT));
        pending.addAll(emergencyRequests(null, employeeId, true, LIST_LIMIT));
        pending.sort(Comparator.comparing(RequestItem::workDate, Comparator.nullsLast(Comparator.<String>naturalOrder())));

        List<Integer> myStores = storeScopeService.visibleStoreIds() == null ? null
                : List.copyOf(storeScopeService.visibleStoreIds());

        return new DashboardResponse.Employee(
                monthStart.toString(), monthEnd.toString(),
                month.employeeName(),
                month.summary(),
                nextShift(employeeId, today),
                weekShifts,
                pending,
                notifications(employeeId),
                count(entityManager, "SELECT COUNT(*) FROM notification WHERE employee_id = :id AND (is_read IS NULL OR is_read = FALSE)",
                        Map.of("id", employeeId)),
                openRounds(myStores));
    }

    // ------------------------------------------------------------------ Ca làm

    private int todayShifts(LocalDate today, Collection<Integer> storeIds) {
        return (int) statisticsService.loadShifts(today, today, storeIds, null).stream()
                .filter(row -> !"CANCELLED".equals(row.workStatus()) && !"PENDING".equals(row.workStatus()))
                .count();
    }

    /** Đúng giờ / đi trễ / vắng của 7 ngày gần nhất. */
    private List<AttendanceDay> attendanceTrend(LocalDate today, Collection<Integer> storeIds) {
        LocalDate from = today.minusDays(6);
        Map<String, int[]> byDay = new LinkedHashMap<>();
        for (LocalDate day = from; !day.isAfter(today); day = day.plusDays(1)) byDay.put(day.toString(), new int[3]);
        for (ShiftRow row : statisticsService.loadShifts(from, today, storeIds, null)) {
            int[] counts = byDay.get(row.workDate());
            if (counts == null) continue;
            if ("COMPLETED".equals(row.workStatus()) || "IN_PROGRESS".equals(row.workStatus())) {
                counts["LATE".equalsIgnoreCase(row.attendanceStatus()) ? 1 : 0]++;
            } else if ("ABSENT".equals(row.workStatus())) {
                counts[2]++;
            }
        }
        return byDay.entrySet().stream()
                .map(entry -> new AttendanceDay(entry.getKey(), entry.getValue()[0], entry.getValue()[1], entry.getValue()[2]))
                .toList();
    }

    private ShiftItem nextShift(Integer employeeId, LocalDate today) {
        return statisticsService.loadShifts(today, today.plusDays(30), null, employeeId).stream()
                .filter(row -> ACTIVE_SHIFT.contains(row.workStatus()))
                .findFirst()
                .map(DashboardService::shiftItem)
                .orElse(null);
    }

    private static ShiftItem shiftItem(ShiftRow row) {
        double planned = plannedHours(row.startTime(), row.endTime());
        BigDecimal estimated = "COMPLETED".equals(row.workStatus())
                ? row.wage()
                : money(row.payRate().multiply(BigDecimal.valueOf(planned)));
        return new ShiftItem(row.assignmentId(), row.workDate(), row.shiftName(), row.startTime(), row.endTime(),
                row.storeName(), "COMPLETED".equals(row.workStatus()) ? row.hours() : planned,
                row.payRate(), estimated, row.workStatus());
    }

    private static double plannedHours(String start, String end) {
        if (start == null || end == null) return 0;
        Duration duration = Duration.between(LocalTime.parse(start), LocalTime.parse(end));
        if (duration.isNegative()) duration = duration.plusHours(24); // ca qua đêm
        return round(duration.toMinutes() / 60.0, 2);
    }

    // ------------------------------------------------------------------ Yêu cầu

    private static final String REGISTRATION_FROM = """
            FROM shift_assignment sa
            JOIN shift_by_date sbd ON sbd.shift_by_date_id = sa.shift_by_date_id
            JOIN shift sh ON sh.shift_id = sbd.shift_id
            JOIN store st ON st.store_id = sh.store_id
            JOIN employee e ON e.employee_id = sa.employee_id
            WHERE sa.status = 'PENDING' AND sbd.work_date >= :today
            """;

    private List<RequestItem> pendingRegistrations(LocalDate today, Collection<Integer> storeIds, Integer employeeId, int limit) {
        if (storeIds != null && storeIds.isEmpty()) return List.of();
        Map<String, Object> params = new HashMap<>();
        String where = registrationFilter(today, storeIds, employeeId, params);
        return rows(entityManager, """
                SELECT sa.assignment_id, 'REGISTER', e.employee_id, e.employee_code, e.full_name, st.store_name,
                       sbd.work_date, COALESCE(sbd.shift_name, sh.shift_name),
                       COALESCE(sbd.start_time, sh.start_time), COALESCE(sbd.end_time, sh.end_time),
                       sa.note, sa.registered_at, sa.status
                """ + REGISTRATION_FROM + where + " ORDER BY sbd.work_date LIMIT " + limit, params)
                .stream().map(DashboardService::requestItem).toList();
    }

    private long countPendingRegistrations(LocalDate today, Collection<Integer> storeIds) {
        if (storeIds != null && storeIds.isEmpty()) return 0;
        Map<String, Object> params = new HashMap<>();
        String where = registrationFilter(today, storeIds, null, params);
        return count(entityManager, "SELECT COUNT(*) " + REGISTRATION_FROM + where, params);
    }

    private static String registrationFilter(LocalDate today, Collection<Integer> storeIds, Integer employeeId,
                                             Map<String, Object> params) {
        params.put("today", today);
        StringBuilder where = new StringBuilder();
        if (storeIds != null) {
            where.append(" AND sh.store_id IN (:storeIds)");
            params.put("storeIds", storeIds);
        }
        if (employeeId != null) {
            where.append(" AND sa.employee_id = :employeeId");
            params.put("employeeId", employeeId);
        }
        return where.toString();
    }

    /** Ca liên quan tới yêu cầu: ca của phân ca gốc, nếu không có thì ca nguồn / ca đích. */
    private static final String EMERGENCY_FROM = """
            FROM emergency_request er
            JOIN employee e ON e.employee_id = er.employee_id
            LEFT JOIN shift_assignment sa ON sa.assignment_id = er.assignment_id
            LEFT JOIN shift_by_date sbd ON sbd.shift_by_date_id = COALESCE(sa.shift_by_date_id, er.from_shift_assignment_id, er.to_assignment_id)
            LEFT JOIN shift sh ON sh.shift_id = sbd.shift_id
            LEFT JOIN store st ON st.store_id = sh.store_id
            WHERE 1 = 1
            """;

    private List<RequestItem> emergencyRequests(Collection<Integer> storeIds, Integer employeeId, boolean pendingOnly, int limit) {
        if (storeIds != null && storeIds.isEmpty()) return List.of();
        Map<String, Object> params = new HashMap<>();
        String where = emergencyFilter(storeIds, employeeId, pendingOnly ? "" : null, null, params);
        return rows(entityManager, """
                SELECT er.emergency_request_id, er.request_type, e.employee_id, e.employee_code, e.full_name, st.store_name,
                       sbd.work_date, COALESCE(sbd.shift_name, sh.shift_name),
                       COALESCE(sbd.start_time, sh.start_time), COALESCE(sbd.end_time, sh.end_time),
                       er.reason, er.requested_at, er.status
                """ + EMERGENCY_FROM + where + " ORDER BY er.requested_at DESC LIMIT " + limit, params)
                .stream().map(DashboardService::requestItem).toList();
    }

    private long countPendingRequests(Collection<Integer> storeIds, String requestType) {
        if (storeIds != null && storeIds.isEmpty()) return 0;
        Map<String, Object> params = new HashMap<>();
        String where = emergencyFilter(storeIds, null, "", requestType, params);
        return count(entityManager, "SELECT COUNT(*) " + EMERGENCY_FROM + where, params);
    }

    /** pending: null = mọi trạng thái, khác null = chỉ PENDING. */
    private static String emergencyFilter(Collection<Integer> storeIds, Integer employeeId, String pending, String requestType,
                                          Map<String, Object> params) {
        StringBuilder where = new StringBuilder();
        if (pending != null) where.append(" AND er.status = 'PENDING'");
        if (storeIds != null) {
            where.append(" AND sh.store_id IN (:storeIds)");
            params.put("storeIds", storeIds);
        }
        if (employeeId != null) {
            where.append(" AND er.employee_id = :employeeId");
            params.put("employeeId", employeeId);
        }
        if (requestType != null) {
            where.append(" AND er.request_type = :requestType");
            params.put("requestType", requestType);
        }
        return where.toString();
    }

    private static RequestItem requestItem(Object[] row) {
        LocalDate workDate = toDate(row[6]);
        return new RequestItem(toInt(row[0]), text(row[1]), toInt(row[2]), text(row[3]), text(row[4]), text(row[5]),
                workDate == null ? null : workDate.toString(), text(row[7]),
                formatTime(toTime(row[8])), formatTime(toTime(row[9])), text(row[10]),
                formatDateTime(row[11]), text(row[12]));
    }

    // ------------------------------------------------------------------ Khác

    private List<ViolationItem> recentViolations() {
        return rows(entityManager, """
                SELECT v.violation_id, e.full_name, st.store_name, v.violation_time, v.rule_name, v.description,
                       v.penalty_amount, v.status
                FROM violation v
                JOIN disciplinary_record dr ON dr.disciplinary_id = v.disciplinary_code_id
                JOIN employee e ON e.employee_id = dr.employee_id
                LEFT JOIN store st ON st.store_id = dr.store_id
                ORDER BY v.violation_time DESC
                LIMIT
                """ + LIST_LIMIT, Map.of()).stream()
                .map(row -> new ViolationItem(toInt(row[0]), text(row[1]), text(row[2]), formatDateTime(row[3]),
                        text(row[4]), text(row[5]), row[6] == null ? null : money(toDecimal(row[6])), text(row[7])))
                .toList();
    }

    /** Việc được giao cho người dùng: việc chưa xong trước, hạn gần trước. */
    private List<TodoItem> todos(Integer employeeId) {
        if (employeeId == null) return List.of();
        return rows(entityManager, """
                SELECT todo_id, title, description, priority, due_at, status
                FROM todo
                WHERE assignee_id = :id
                ORDER BY CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END, due_at IS NULL, due_at
                LIMIT
                """ + LIST_LIMIT, Map.of("id", employeeId)).stream()
                .map(row -> new TodoItem(toInt(row[0]), text(row[1]), text(row[2]), text(row[3]),
                        formatDateTime(row[4]), text(row[5])))
                .toList();
    }

    private List<NotificationItem> notifications(Integer employeeId) {
        return rows(entityManager, """
                SELECT notification_id, title, content, notification_type, created_at, is_read
                FROM notification
                WHERE employee_id = :id
                ORDER BY created_at DESC
                LIMIT 4
                """, Map.of("id", employeeId)).stream()
                .map(row -> new NotificationItem(toInt(row[0]), text(row[1]), text(row[2]), text(row[3]),
                        formatDateTime(row[4]), toBool(row[5])))
                .toList();
    }

    /** Đợt đăng ký đang mở; storeIds = null nghĩa là mọi cửa hàng. */
    private List<RoundItem> openRounds(Collection<Integer> storeIds) {
        if (storeIds != null && storeIds.isEmpty()) return List.of();
        Map<String, Object> params = new HashMap<>();
        StringBuilder sql = new StringBuilder("""
                SELECT r.schedule_round_id, r.round_name, st.store_name, r.registration_start_at, r.registration_end_at
                FROM schedule_round r
                LEFT JOIN store st ON st.store_id = r.store_id
                WHERE r.status = 'OPEN' AND (r.registration_end_at IS NULL OR r.registration_end_at >= NOW())
                """);
        if (storeIds != null) {
            sql.append(" AND (r.store_id IS NULL OR r.store_id IN (:storeIds))");
            params.put("storeIds", storeIds);
        }
        sql.append(" ORDER BY r.registration_end_at IS NULL, r.registration_end_at LIMIT 3");
        return rows(entityManager, sql.toString(), params).stream()
                .map(row -> new RoundItem(toInt(row[0]), text(row[1]), text(row[2]), formatDateTime(row[3]), formatDateTime(row[4])))
                .toList();
    }

    private String employeeName(Integer employeeId) {
        if (employeeId == null) return null;
        List<Object[]> result = rows(entityManager, "SELECT full_name FROM employee WHERE employee_id = :id", Map.of("id", employeeId));
        return result.isEmpty() ? null : text(result.get(0)[0]);
    }

    /** Admin / quản lý có thể không có hồ sơ nhân viên. */
    private Integer currentEmployeeIdOrNull() {
        try {
            return storeScopeService.currentEmployeeId();
        } catch (ApiException ex) {
            if (ex.status() == HttpStatus.FORBIDDEN) return null;
            throw ex;
        }
    }
}
