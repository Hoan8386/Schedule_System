package com.vn.schedule.service;

import com.vn.schedule.domain.Employee;
import com.vn.schedule.domain.SchedulePeriod;
import com.vn.schedule.domain.ScheduleRound;
import com.vn.schedule.domain.ScheduleSession;
import com.vn.schedule.domain.Shift;
import com.vn.schedule.domain.ShiftAssignment;
import com.vn.schedule.domain.ShiftByDate;
import com.vn.schedule.repository.ShiftAssignmentRepository;
import com.vn.schedule.repository.ShiftByDateRepository;
import com.vn.schedule.repository.ShiftRepository;
import com.vn.schedule.util.ApiException;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static com.vn.schedule.util.SqlValues.*;

/**
 * Nhân viên đăng ký ca ngay trên thời khóa biểu: chọn ca mẫu của nhóm + ngày làm.
 * Nếu ngày đó chưa có ca theo ngày thì tạo mới (gắn kỳ / đợt / phiên đang mở), sau đó tạo đăng ký chờ duyệt.
 */
@Service
public class ShiftRegistrationService {
    private static final Set<String> INACTIVE = Set.of("CANCELLED", "REJECTED");
    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATE_TIME = DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy");

    private final ShiftRepository shiftRepository;
    private final ShiftByDateRepository shiftByDateRepository;
    private final ShiftAssignmentRepository assignmentRepository;
    private final ShiftGroupMemberService memberService;
    private final StoreScopeService storeScopeService;

    @PersistenceContext
    private EntityManager entityManager;

    public ShiftRegistrationService(ShiftRepository shiftRepository, ShiftByDateRepository shiftByDateRepository,
                                    ShiftAssignmentRepository assignmentRepository, ShiftGroupMemberService memberService,
                                    StoreScopeService storeScopeService) {
        this.shiftRepository = shiftRepository;
        this.shiftByDateRepository = shiftByDateRepository;
        this.assignmentRepository = assignmentRepository;
        this.memberService = memberService;
        this.storeScopeService = storeScopeService;
    }

    /** Kỳ / đợt / phiên đăng ký áp dụng cho một ca vào một ngày. */
    private record Window(Integer periodId, Integer roundId, Integer sessionId) {
    }

    @Transactional
    public ShiftGroupMemberService.OpenShift register(Integer shiftId, LocalDate workDate) {
        if (shiftId == null || workDate == null) throw bad("Thiếu ca hoặc ngày làm");
        Integer employeeId = storeScopeService.currentEmployeeId();

        Shift shift = shiftRepository.findById(shiftId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy ca"));
        if (!"ACTIVE".equalsIgnoreCase(shift.getStatus())) throw bad("Ca " + shift.getShiftName() + " đã ngừng hoạt động");
        if (shift.getShiftGroup() == null) throw bad("Ca " + shift.getShiftName() + " chưa thuộc nhóm ca nào");
        if (!memberService.isMember(shift.getShiftGroup().getId(), employeeId)) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "Bạn không thuộc nhóm ca \"" + shift.getShiftGroup().getShiftGroupName() + "\" nên không thể đăng ký ca này");
        }
        if (workDate.isBefore(LocalDate.now())) throw bad("Không thể đăng ký ca của ngày đã qua");

        Window window = registrationWindow(shift, workDate);

        ShiftByDate shiftByDate = shiftByDateRepository.findByShift_IdAndWorkDate(shiftId, workDate)
                .orElseGet(() -> createShiftByDate(shift, workDate, window));
        if (!"OPEN".equalsIgnoreCase(shiftByDate.getStatus())) {
            throw bad("Ca " + shift.getShiftName() + " ngày " + workDate.format(DATE) + " không còn mở đăng ký");
        }

        List<Object[]> assignments = rows(entityManager, """
                SELECT assignment_id, employee_id, status FROM shift_assignment WHERE shift_by_date_id = :id
                """, Map.of("id", shiftByDate.getId()));
        long active = assignments.stream().filter(row -> !INACTIVE.contains(String.valueOf(row[2]).toUpperCase())).count();
        Object[] mine = assignments.stream().filter(row -> employeeId.equals(toInt(row[1]))).findFirst().orElse(null);
        if (mine != null && !INACTIVE.contains(String.valueOf(mine[2]).toUpperCase())) {
            throw bad("Bạn đã đăng ký ca này rồi");
        }
        Integer capacity = shiftByDate.getMaxCapacity() != null ? shiftByDate.getMaxCapacity() : shift.getMaxCapacity();
        if (capacity != null && active >= capacity) throw bad("Ca này đã đủ " + capacity + " người");

        // Bảng phân ca chỉ cho một bản ghi / nhân viên / ca theo ngày: đăng ký lại thì dùng lại bản ghi đã hủy
        ShiftAssignment assignment = mine != null
                ? assignmentRepository.findById(toInt(mine[0])).orElseThrow()
                : new ShiftAssignment();
        assignment.setShiftByDate(shiftByDate);
        assignment.setEmployee(entityManager.getReference(Employee.class, employeeId));
        assignment.setStatus("PENDING");
        assignment.setRegisteredAt(LocalDateTime.now());
        assignment.setApprovedBy(null);
        assignment.setApprovedAt(null);
        assignment.setCancelledBy(null);
        assignment.setCancelledAt(null);
        assignment.setCancellationReason(null);
        assignmentRepository.saveAndFlush(assignment);

        return memberService.shiftsByDate(employeeId, workDate, workDate, shiftByDate.getId()).get(0);
    }

    /**
     * Ngày phải nằm trong kỳ OPEN có đợt đăng ký tại cửa hàng của ca; đợt (và phiên của nhóm, nếu đợt chia phiên)
     * phải đang trong thời gian mở đăng ký.
     */
    private Window registrationWindow(Shift shift, LocalDate workDate) {
        List<Object[]> rounds = rows(entityManager, """
                SELECT r.schedule_round_id, p.schedule_period_id, r.round_name, r.registration_start_at, r.registration_end_at
                FROM schedule_round r
                JOIN schedule_period p ON p.schedule_period_id = r.schedule_period_id
                WHERE p.status = 'OPEN' AND r.status <> 'CLOSED'
                  AND (r.store_id IS NULL OR r.store_id = :storeId)
                  AND :workDate BETWEEN COALESCE(p.effective_start_date, p.start_date) AND COALESCE(p.effective_end_date, p.end_date)
                ORDER BY r.registration_start_at
                """, Map.of("storeId", shift.getStore().getId(), "workDate", workDate));
        if (rounds.isEmpty()) {
            throw bad("Ngày " + workDate.format(DATE) + " không thuộc kỳ đăng ký nào đang mở của cửa hàng");
        }

        LocalDateTime now = LocalDateTime.now();
        Object[] round = rounds.stream()
                .filter(row -> isOpen(toDateTimeOrNull(row[3]), toDateTimeOrNull(row[4]), now))
                .findFirst()
                .orElse(rounds.get(0));
        requireOpen("Đợt \"" + round[2] + "\"", toDateTimeOrNull(round[3]), toDateTimeOrNull(round[4]), now);

        Integer roundId = toInt(round[0]);
        List<Object[]> sessions = rows(entityManager, """
                SELECT schedule_session_id, shift_group_id, session_name, session_open_at, session_close_at, status
                FROM schedule_session WHERE schedule_round_id = :roundId
                """, Map.of("roundId", roundId));
        Integer sessionId = null;
        if (!sessions.isEmpty()) {
            Integer groupId = shift.getShiftGroup().getId();
            Object[] session = sessions.stream()
                    .filter(row -> groupId.equals(toInt(row[1])))
                    .findFirst()
                    .or(() -> sessions.stream().filter(row -> row[1] == null).findFirst())
                    .orElseThrow(() -> bad("Đợt \"" + round[2] + "\" không có phiên đăng ký cho nhóm \""
                            + shift.getShiftGroup().getShiftGroupName() + "\""));
            if ("CLOSED".equalsIgnoreCase(String.valueOf(session[5]))) throw bad("Phiên \"" + session[2] + "\" đã đóng");
            requireOpen("Phiên \"" + session[2] + "\"", toDateTimeOrNull(session[3]), toDateTimeOrNull(session[4]), now);
            sessionId = toInt(session[0]);
        }
        return new Window(toInt(round[1]), roundId, sessionId);
    }

    private ShiftByDate createShiftByDate(Shift shift, LocalDate workDate, Window window) {
        ShiftByDate entity = new ShiftByDate();
        entity.setShift(shift);
        entity.setSchedulePeriod(entityManager.getReference(SchedulePeriod.class, window.periodId()));
        entity.setScheduleRound(entityManager.getReference(ScheduleRound.class, window.roundId()));
        if (window.sessionId() != null) entity.setScheduleSession(entityManager.getReference(ScheduleSession.class, window.sessionId()));
        entity.setWorkDate(workDate);
        entity.setShiftName(shift.getShiftName());
        entity.setStartTime(shift.getStartTime());
        entity.setEndTime(shift.getEndTime());
        entity.setMaxCapacity(shift.getMaxCapacity());
        entity.setPayRate(shift.getPayRate() != null ? shift.getPayRate() : shift.getShiftGroup().getPayRate());
        entity.setStatus("OPEN");
        entity.setCreatedAt(LocalDateTime.now());
        return shiftByDateRepository.saveAndFlush(entity);
    }

    private static boolean isOpen(LocalDateTime openAt, LocalDateTime closeAt, LocalDateTime now) {
        return (openAt == null || !now.isBefore(openAt)) && (closeAt == null || !now.isAfter(closeAt));
    }

    private static void requireOpen(String label, LocalDateTime openAt, LocalDateTime closeAt, LocalDateTime now) {
        if (openAt != null && now.isBefore(openAt)) throw bad(label + " chưa mở, mở đăng ký lúc " + openAt.format(DATE_TIME));
        if (closeAt != null && now.isAfter(closeAt)) throw bad(label + " đã đóng đăng ký lúc " + closeAt.format(DATE_TIME));
    }

    private static LocalDateTime toDateTimeOrNull(Object value) {
        return value == null ? null : toDateTime(value);
    }

    private static ApiException bad(String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, message);
    }
}
