package com.vn.schedule.service;

import com.vn.schedule.dto.response.StatisticsResponse.DailyStat;
import com.vn.schedule.dto.response.StatisticsResponse.EmployeeStat;
import com.vn.schedule.dto.response.StatisticsResponse.Overview;
import com.vn.schedule.dto.response.StatisticsResponse.PayrollInfo;
import com.vn.schedule.dto.response.StatisticsResponse.Personal;
import com.vn.schedule.dto.response.StatisticsResponse.ShiftRow;
import com.vn.schedule.dto.response.StatisticsResponse.StoreOption;
import com.vn.schedule.dto.response.StatisticsResponse.StoreStat;
import com.vn.schedule.dto.response.StatisticsResponse.Summary;
import com.vn.schedule.util.ApiException;

import static com.vn.schedule.util.SqlValues.*;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.stream.Collectors;

/**
 * Thống kê ca làm, giờ công, tiền công, chuyên cần và vi phạm.
 * Đơn vị tính là một phân ca (shift_assignment) của nhân viên trên một ca theo ngày;
 * giờ công lấy từ chấm công, tiền công = giờ công × đơn giá của ca.
 */
@Service
public class StatisticsService {
    private static final long MAX_RANGE_DAYS = 366;

    private final StoreScopeService storeScopeService;

    @PersistenceContext
    private EntityManager entityManager;

    public StatisticsService(StoreScopeService storeScopeService) {
        this.storeScopeService = storeScopeService;
    }

    // ------------------------------------------------------------------ API

    /** Toàn chuỗi (quản lý / admin), có thể lọc theo một cửa hàng. */
    @Transactional(readOnly = true)
    public Overview managerOverview(LocalDate from, LocalDate to, Integer storeId) {
        if (!storeScopeService.isGlobalUser()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Chỉ quản lý chuỗi mới xem được thống kê toàn chuỗi");
        }
        return overview(range(from, to), allStores(), storeId);
    }

    /** Các cửa hàng mà trưởng cửa hàng đang quản lý. */
    @Transactional(readOnly = true)
    public Overview storeManagerOverview(LocalDate from, LocalDate to, Integer storeId) {
        return overview(range(from, to), visibleStores(), storeId);
    }

    /** Lịch sử ca của một nhân viên trong phạm vi cửa hàng người xem được phép. */
    @Transactional(readOnly = true)
    public List<ShiftRow> employeeShifts(Integer employeeId, LocalDate from, LocalDate to, Integer storeId) {
        LocalDate[] range = range(from, to);
        List<Integer> storeIds = scopeStoreIds(visibleStores(), storeId);
        return loadShifts(range[0], range[1], storeIds, employeeId);
    }

    /** Thống kê cá nhân của nhân viên đang đăng nhập. */
    @Transactional(readOnly = true)
    public Personal personal(LocalDate from, LocalDate to, Integer storeId) {
        LocalDate[] range = range(from, to);
        Integer employeeId = storeScopeService.currentEmployeeId();

        List<ShiftRow> allShifts = loadShifts(range[0], range[1], null, employeeId);
        Map<Integer, String> storeNames = new LinkedHashMap<>();
        allShifts.forEach(row -> storeNames.putIfAbsent(row.storeId(), row.storeName()));
        List<StoreOption> stores = storeNames.entrySet().stream()
                .map(entry -> new StoreOption(entry.getKey(), entry.getValue()))
                .toList();

        List<ShiftRow> shifts = storeId == null
                ? allShifts
                : allShifts.stream().filter(row -> storeId.equals(row.storeId())).toList();

        List<Object[]> violations = violationRows(range[0], range[1], storeId == null ? null : List.of(storeId), employeeId);
        Map<Integer, Double> scores = averageScores(range[0], range[1], List.of(employeeId));
        Summary summary = summarize(shifts, violations, scores.get(employeeId), 1, stores.size());

        String employeeName = text(singleValue(
                "SELECT full_name FROM employee WHERE employee_id = :id", Map.of("id", employeeId)));
        return new Personal(range[0].toString(), range[1].toString(), employeeId, employeeName, stores, summary,
                daily(shifts, range[0], range[1]), sortedByDateDesc(shifts),
                payrollInfo(employeeId, range[0], range[1], summary.totalWage()));
    }

    // ------------------------------------------------------------------ Overview

    private Overview overview(LocalDate[] range, List<StoreOption> scopeStores, Integer storeId) {
        List<Integer> storeIds = scopeStoreIds(scopeStores, storeId);
        LocalDate from = range[0];
        LocalDate to = range[1];

        List<ShiftRow> shifts = loadShifts(from, to, storeIds, null);
        List<Object[]> members = storeMembers(storeIds);
        List<Object[]> violations = violationRows(from, to, storeIds, null);

        Map<Integer, String[]> employeeInfo = new LinkedHashMap<>();
        Map<Integer, Set<String>> employeeStores = new HashMap<>();
        for (Object[] row : members) {
            Integer employeeId = toInt(row[0]);
            employeeInfo.putIfAbsent(employeeId, new String[] { text(row[1]), text(row[2]) });
            employeeStores.computeIfAbsent(employeeId, key -> new LinkedHashSet<>()).add(text(row[4]));
        }
        for (ShiftRow row : shifts) {
            employeeInfo.putIfAbsent(row.employeeId(), new String[] { row.employeeCode(), row.employeeName() });
            employeeStores.computeIfAbsent(row.employeeId(), key -> new LinkedHashSet<>()).add(row.storeName());
        }

        Map<Integer, Double> scores = averageScores(from, to, employeeInfo.keySet());
        Map<Integer, List<ShiftRow>> shiftsByEmployee = shifts.stream()
                .collect(Collectors.groupingBy(ShiftRow::employeeId));
        Map<Integer, List<Object[]>> violationsByEmployee = violations.stream()
                .collect(Collectors.groupingBy(row -> toInt(row[0])));

        List<EmployeeStat> employees = new ArrayList<>();
        for (Map.Entry<Integer, String[]> entry : employeeInfo.entrySet()) {
            Integer employeeId = entry.getKey();
            Summary s = summarize(shiftsByEmployee.getOrDefault(employeeId, List.of()),
                    violationsByEmployee.getOrDefault(employeeId, List.of()), scores.get(employeeId), 1, 0);
            employees.add(new EmployeeStat(employeeId, entry.getValue()[0], entry.getValue()[1],
                    String.join(", ", employeeStores.getOrDefault(employeeId, Set.of())),
                    s.scheduledShifts(), s.completedShifts(), s.lateCount(), s.absentCount(), s.totalHours(),
                    s.totalWage(), s.violationCount(), s.totalPenalty(), s.averageScore(), s.attendanceRate()));
        }
        employees.sort(Comparator.comparingDouble(EmployeeStat::totalHours).reversed()
                .thenComparing(EmployeeStat::fullName, Comparator.nullsLast(String::compareTo)));

        Map<Integer, List<ShiftRow>> shiftsByStore = shifts.stream().collect(Collectors.groupingBy(ShiftRow::storeId));
        Map<Integer, Long> violationsByStore = violations.stream()
                .filter(row -> row[1] != null)
                .collect(Collectors.groupingBy(row -> toInt(row[1]), Collectors.summingLong(row -> toLong(row[2]))));
        Map<Integer, Set<Integer>> membersByStore = new HashMap<>();
        members.forEach(row -> membersByStore.computeIfAbsent(toInt(row[3]), key -> new LinkedHashSet<>()).add(toInt(row[0])));
        shifts.forEach(row -> membersByStore.computeIfAbsent(row.storeId(), key -> new LinkedHashSet<>()).add(row.employeeId()));

        List<StoreStat> byStore = new ArrayList<>();
        for (StoreOption store : scopeStores) {
            if (!storeIds.contains(store.storeId())) continue;
            Summary s = summarize(shiftsByStore.getOrDefault(store.storeId(), List.of()), List.of(), null, 0, 1);
            byStore.add(new StoreStat(store.storeId(), store.storeName(),
                    membersByStore.getOrDefault(store.storeId(), Set.of()).size(),
                    s.scheduledShifts(), s.completedShifts(), s.lateCount(), s.absentCount(), s.totalHours(),
                    s.totalWage(), violationsByStore.getOrDefault(store.storeId(), 0L).intValue(), s.attendanceRate()));
        }

        Double averageScore = scores.isEmpty() ? null
                : round(scores.values().stream().mapToDouble(Double::doubleValue).average().orElse(0), 2);
        Summary summary = summarize(shifts, violations, averageScore, employeeInfo.size(), storeIds.size());

        return new Overview(from.toString(), to.toString(), scopeStores, summary, byStore,
                daily(shifts, from, to), employees);
    }

    // ------------------------------------------------------------------ Aggregation

    private Summary summarize(List<ShiftRow> shifts, List<Object[]> violations, Double averageScore,
                              int employees, int stores) {
        int scheduled = 0, completed = 0, pending = 0, upcoming = 0, late = 0, absent = 0;
        double hours = 0;
        BigDecimal wage = BigDecimal.ZERO;
        for (ShiftRow row : shifts) {
            switch (row.workStatus()) {
                case "PENDING" -> pending++;
                case "CANCELLED" -> { }
                default -> {
                    scheduled++;
                    if ("COMPLETED".equals(row.workStatus())) completed++;
                    if ("ABSENT".equals(row.workStatus())) absent++;
                    if ("UPCOMING".equals(row.workStatus())) upcoming++;
                    if ("LATE".equalsIgnoreCase(row.attendanceStatus())) late++;
                }
            }
            hours += row.hours();
            wage = wage.add(row.wage());
        }
        int violationCount = 0;
        BigDecimal penalty = BigDecimal.ZERO;
        for (Object[] row : violations) {
            violationCount += (int) toLong(row[2]);
            penalty = penalty.add(toDecimal(row[3]));
        }
        int finished = completed + absent;
        double attendanceRate = finished == 0 ? 0 : round(completed * 100.0 / finished, 1);
        return new Summary(employees, stores, scheduled, completed, pending, upcoming, late, absent,
                round(hours, 2), money(wage), violationCount, money(penalty), averageScore, attendanceRate);
    }

    private List<DailyStat> daily(List<ShiftRow> shifts, LocalDate from, LocalDate to) {
        Map<String, List<ShiftRow>> byDate = new TreeMap<>(shifts.stream()
                .filter(row -> "COMPLETED".equals(row.workStatus()))
                .collect(Collectors.groupingBy(ShiftRow::workDate)));
        List<DailyStat> result = new ArrayList<>();
        for (LocalDate date = from; !date.isAfter(to); date = date.plusDays(1)) {
            List<ShiftRow> rows = byDate.getOrDefault(date.toString(), List.of());
            result.add(new DailyStat(date.toString(), rows.size(),
                    round(rows.stream().mapToDouble(ShiftRow::hours).sum(), 2),
                    money(rows.stream().map(ShiftRow::wage).reduce(BigDecimal.ZERO, BigDecimal::add))));
        }
        return result;
    }

    private PayrollInfo payrollInfo(Integer employeeId, LocalDate from, LocalDate to, BigDecimal recordedWage) {
        Query query = entityManager.createNativeQuery("""
                SELECT
                    COALESCE(SUM(CASE WHEN status IN ('APPROVED', 'PAID') THEN total_amount END), 0),
                    COALESCE(SUM(CASE WHEN status = 'PAID' THEN total_amount END), 0),
                    COALESCE(SUM(bonus_amount), 0),
                    COALESCE(SUM(penalty_amount), 0)
                FROM payroll
                WHERE employee_id = :employeeId AND payroll_month BETWEEN :from AND :to
                """)
                .setParameter("employeeId", employeeId)
                .setParameter("from", from.withDayOfMonth(1))
                .setParameter("to", to);
        Object[] row = (Object[]) query.getSingleResult();
        return new PayrollInfo(recordedWage, money(toDecimal(row[0])), money(toDecimal(row[1])),
                money(toDecimal(row[2])), money(toDecimal(row[3])));
    }

    // ------------------------------------------------------------------ Queries

    /**
     * Các phân ca trong khoảng ngày, đã phân loại trạng thái và tính giờ/tiền công.
     * storeIds = null nghĩa là mọi cửa hàng; employeeId = null nghĩa là mọi nhân viên.
     */
    public List<ShiftRow> loadShifts(LocalDate from, LocalDate to, Collection<Integer> storeIds, Integer employeeId) {
        if (storeIds != null && storeIds.isEmpty()) return List.of();
        StringBuilder sql = new StringBuilder("""
                SELECT sa.assignment_id, sbd.shift_by_date_id, e.employee_id, e.employee_code, e.full_name,
                       st.store_id, st.store_name, sbd.work_date,
                       COALESCE(sbd.shift_name, sh.shift_name),
                       COALESCE(sbd.start_time, sh.start_time),
                       COALESCE(sbd.end_time, sh.end_time),
                       COALESCE(sbd.pay_rate, sh.pay_rate, sg.pay_rate, 0),
                       sa.status, a.attendance_status, a.check_in_at, a.check_out_at, a.worked_hours,
                       (SELECT er.request_type FROM emergency_request er
                        WHERE er.status = 'PENDING' AND er.employee_id = sa.employee_id
                          AND (er.assignment_id = sa.assignment_id OR er.from_shift_assignment_id = sa.shift_by_date_id)
                        ORDER BY er.emergency_request_id DESC LIMIT 1),
                       CASE WHEN sp.schedule_period_id IS NULL
                                 OR sp.status IN ('CLOSED', 'FINALIZED', 'PUBLISHED', 'COMPLETED', 'LOCKED')
                                 OR sp.finalized_at IS NOT NULL
                                 OR (sp.registration_close_at IS NOT NULL AND sp.registration_close_at < NOW())
                            THEN 1 ELSE 0 END
                FROM shift_assignment sa
                JOIN shift_by_date sbd ON sbd.shift_by_date_id = sa.shift_by_date_id
                JOIN shift sh ON sh.shift_id = sbd.shift_id
                LEFT JOIN shift_group sg ON sg.shift_group_id = sh.shift_group_id
                LEFT JOIN schedule_period sp ON sp.schedule_period_id = sbd.schedule_period_id
                JOIN store st ON st.store_id = sh.store_id
                JOIN employee e ON e.employee_id = sa.employee_id
                LEFT JOIN attendance a ON a.attendance_id = (
                    SELECT MAX(a2.attendance_id) FROM attendance a2
                    WHERE a2.shift_by_date_id = sa.shift_by_date_id AND a2.employee_id = sa.employee_id)
                WHERE sbd.work_date BETWEEN :from AND :to
                """);
        Map<String, Object> params = new HashMap<>();
        params.put("from", from);
        params.put("to", to);
        if (storeIds != null) {
            sql.append(" AND sh.store_id IN (:storeIds)");
            params.put("storeIds", storeIds);
        }
        if (employeeId != null) {
            sql.append(" AND sa.employee_id = :employeeId");
            params.put("employeeId", employeeId);
        }
        sql.append(" ORDER BY sbd.work_date, COALESCE(sbd.start_time, sh.start_time), e.full_name");

        LocalDate today = LocalDate.now();
        List<ShiftRow> result = new ArrayList<>();
        for (Object[] row : resultRows(sql.toString(), params)) {
            LocalDate workDate = toDate(row[7]);
            LocalTime start = toTime(row[9]);
            LocalTime end = toTime(row[10]);
            BigDecimal payRate = toDecimal(row[11]);
            String assignmentStatus = text(row[12]);
            String attendanceStatus = text(row[13]);
            LocalDateTime checkIn = toDateTime(row[14]);
            LocalDateTime checkOut = toDateTime(row[15]);
            BigDecimal workedHours = row[16] == null ? null : toDecimal(row[16]);

            String workStatus = workStatus(assignmentStatus, attendanceStatus, checkIn, checkOut, workedHours, workDate, today);
            double hours = "COMPLETED".equals(workStatus) ? workedHours(workedHours, checkIn, checkOut) : 0;
            BigDecimal wage = money(payRate.multiply(BigDecimal.valueOf(hours)));

            result.add(new ShiftRow(toInt(row[0]), toInt(row[1]), toInt(row[2]), text(row[3]), text(row[4]),
                    toInt(row[5]), text(row[6]), workDate == null ? null : workDate.toString(), text(row[8]),
                    formatTime(start), formatTime(end), assignmentStatus, attendanceStatus,
                    formatDateTime(checkIn), formatDateTime(checkOut), round(hours, 2), money(payRate), wage, workStatus,
                    text(row[17]), toInt(row[18]) == 1));
        }
        return result;
    }

    /** employee_id, employee_code, full_name, store_id, store_name của nhân viên đang làm tại các cửa hàng. */
    private List<Object[]> storeMembers(Collection<Integer> storeIds) {
        if (storeIds.isEmpty()) return List.of();
        return resultRows("""
                SELECT e.employee_id, e.employee_code, e.full_name, s.store_id, s.store_name
                FROM employee_store es
                JOIN employee e ON e.employee_id = es.employee_id
                JOIN store s ON s.store_id = es.store_id
                WHERE es.status = 'ACTIVE' AND es.store_id IN (:storeIds)
                ORDER BY e.full_name
                """, Map.of("storeIds", storeIds));
    }

    /** employee_id, store_id, số vi phạm, tổng tiền phạt. */
    private List<Object[]> violationRows(LocalDate from, LocalDate to, Collection<Integer> storeIds, Integer employeeId) {
        if (storeIds != null && storeIds.isEmpty()) return List.of();
        StringBuilder sql = new StringBuilder("""
                SELECT dr.employee_id, dr.store_id, COUNT(*), COALESCE(SUM(v.penalty_amount), 0)
                FROM violation v
                JOIN disciplinary_record dr ON dr.disciplinary_id = v.disciplinary_code_id
                WHERE v.violation_time >= :fromTime AND v.violation_time < :toTime
                  AND (v.status IS NULL OR v.status NOT IN ('CANCELLED', 'REJECTED'))
                """);
        Map<String, Object> params = new HashMap<>();
        params.put("fromTime", from.atStartOfDay());
        params.put("toTime", to.plusDays(1).atStartOfDay());
        if (storeIds != null) {
            sql.append(" AND dr.store_id IN (:storeIds)");
            params.put("storeIds", storeIds);
        }
        if (employeeId != null) {
            sql.append(" AND dr.employee_id = :employeeId");
            params.put("employeeId", employeeId);
        }
        sql.append(" GROUP BY dr.employee_id, dr.store_id");
        return resultRows(sql.toString(), params);
    }

    private Map<Integer, Double> averageScores(LocalDate from, LocalDate to, Collection<Integer> employeeIds) {
        if (employeeIds.isEmpty()) return Map.of();
        Map<Integer, Double> result = new HashMap<>();
        for (Object[] row : resultRows("""
                SELECT employee_id, AVG(total_score)
                FROM employee_evaluation
                WHERE employee_id IN (:employeeIds) AND total_score IS NOT NULL
                  AND (period_start IS NULL OR period_start <= :to)
                  AND (period_end IS NULL OR period_end >= :from)
                GROUP BY employee_id
                """, Map.of("employeeIds", employeeIds, "from", from, "to", to))) {
            result.put(toInt(row[0]), round(toDecimal(row[1]).doubleValue(), 2));
        }
        return result;
    }

    private List<StoreOption> allStores() {
        return resultRows("SELECT store_id, store_name FROM store ORDER BY store_name", Map.of()).stream()
                .map(row -> new StoreOption(toInt(row[0]), text(row[1])))
                .toList();
    }

    private List<StoreOption> visibleStores() {
        Set<Integer> visible = storeScopeService.visibleStoreIds();
        if (visible == null) return allStores();
        if (visible.isEmpty()) return List.of();
        return resultRows("SELECT store_id, store_name FROM store WHERE store_id IN (:ids) ORDER BY store_name",
                Map.of("ids", visible)).stream()
                .map(row -> new StoreOption(toInt(row[0]), text(row[1])))
                .toList();
    }

    private List<Integer> scopeStoreIds(List<StoreOption> scopeStores, Integer storeId) {
        List<Integer> ids = scopeStores.stream().map(StoreOption::storeId).toList();
        if (storeId == null) return ids;
        if (!ids.contains(storeId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem thống kê cửa hàng này");
        }
        return List.of(storeId);
    }

    private List<Object[]> resultRows(String sql, Map<String, ?> params) {
        return rows(entityManager, sql, params);
    }

    private Object singleValue(String sql, Map<String, ?> params) {
        List<Object[]> rows = resultRows(sql, params);
        return rows.isEmpty() ? null : rows.get(0)[0];
    }

    // ------------------------------------------------------------------ Helpers

    private static String workStatus(String assignmentStatus, String attendanceStatus, LocalDateTime checkIn,
                                     LocalDateTime checkOut, BigDecimal workedHours, LocalDate workDate, LocalDate today) {
        String status = assignmentStatus == null ? "" : assignmentStatus.toUpperCase();
        if (status.equals("CANCELLED") || status.equals("REJECTED")) return "CANCELLED";
        if (status.equals("PENDING")) return "PENDING";
        boolean worked = checkOut != null || (workedHours != null && workedHours.signum() > 0);
        if (worked) return "COMPLETED";
        if ("ABSENT".equalsIgnoreCase(attendanceStatus)) return "ABSENT";
        if (checkIn != null) return "IN_PROGRESS";
        if (workDate != null && workDate.isBefore(today)) return "ABSENT";
        return "UPCOMING";
    }

    private static double workedHours(BigDecimal workedHours, LocalDateTime checkIn, LocalDateTime checkOut) {
        if (workedHours != null && workedHours.signum() > 0) return workedHours.doubleValue();
        if (checkIn != null && checkOut != null && checkOut.isAfter(checkIn)) {
            return Duration.between(checkIn, checkOut).toMinutes() / 60.0;
        }
        return 0;
    }

    private static LocalDate[] range(LocalDate from, LocalDate to) {
        LocalDate today = LocalDate.now();
        LocalDate start = from != null ? from : (to != null ? to.withDayOfMonth(1) : today.withDayOfMonth(1));
        LocalDate end = to != null ? to : start.withDayOfMonth(start.lengthOfMonth());
        if (end.isBefore(start)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Ngày kết thúc phải sau ngày bắt đầu");
        }
        if (ChronoUnit.DAYS.between(start, end) > MAX_RANGE_DAYS) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Khoảng thời gian thống kê tối đa 1 năm");
        }
        return new LocalDate[] { start, end };
    }

    private static List<ShiftRow> sortedByDateDesc(List<ShiftRow> shifts) {
        return shifts.stream()
                .sorted(Comparator.comparing(ShiftRow::workDate, Comparator.nullsLast(Comparator.<String>reverseOrder()))
                        .thenComparing(ShiftRow::startTime, Comparator.nullsLast(Comparator.<String>naturalOrder())))
                .toList();
    }
}
