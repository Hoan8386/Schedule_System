package com.vn.schedule.service;

import com.vn.schedule.util.ApiException;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.vn.schedule.util.SqlValues.*;

/**
 * Việc cần xử lý / thông báo cần quan tâm hiện trên chuông thông báo (mọi vai trò).
 * Mỗi mục: key, title, detail, count, page (id menu để mở), tone (warning = cần xử lý, info = cần quan tâm).
 * Chỉ trả các mục có count > 0; số liệu tính trực tiếp nên luôn khớp dữ liệu hiện tại.
 */
@Service
public class TaskReminderService {
    public record Task(String key, String title, String detail, long count, String page, String tone) {
    }

    private final StoreScopeService storeScopeService;
    private final FeedbackService feedbackService;

    @PersistenceContext
    private EntityManager entityManager;

    public TaskReminderService(StoreScopeService storeScopeService, FeedbackService feedbackService) {
        this.storeScopeService = storeScopeService;
        this.feedbackService = feedbackService;
    }

    @Transactional(readOnly = true)
    public List<Task> myTasks() {
        String role = List.of("ADMIN", "MANAGER", "STORE_MANAGER", "EMPLOYEE").stream()
                .filter(storeScopeService::isCurrentUserRole)
                .findFirst()
                .orElse("");
        List<Task> tasks = new ArrayList<>();
        switch (role) {
            case "ADMIN" -> {
                add(tasks, "feedback", "Phản hồi chờ xử lý", "Phản hồi đang ở trạng thái Chờ xử lý", pendingFeedback(), "phanhoi", "warning");
            }
            case "MANAGER", "STORE_MANAGER" -> managerTasks(tasks, role);
            case "EMPLOYEE" -> employeeTasks(tasks);
            default -> {
            }
        }
        return tasks;
    }

    // ------------------------------------------------------------------ Quản lý / trưởng cửa hàng

    private void managerTasks(List<Task> tasks, String role) {
        Set<Integer> storeIds = storeScopeService.visibleStoreIds();
        if (storeIds != null && storeIds.isEmpty()) return;
        boolean storeManager = "STORE_MANAGER".equals(role);
        String schedulePage = storeManager ? "quanlyca" : "lich";
        Map<String, Object> params = new HashMap<>();
        String storeFilter = "";
        if (storeIds != null) {
            storeFilter = " AND sh.store_id IN (:storeIds)";
            params.put("storeIds", storeIds);
        }

        add(tasks, "registrations", "Đăng ký ca chờ duyệt", "Nhân viên đăng ký ca sắp tới đang chờ duyệt",
                count(entityManager, """
                        SELECT COUNT(*) FROM shift_assignment sa
                        JOIN shift_by_date sbd ON sbd.shift_by_date_id = sa.shift_by_date_id
                        JOIN shift sh ON sh.shift_id = sbd.shift_id
                        WHERE sa.status = 'PENDING' AND sbd.work_date >= CURDATE()""" + storeFilter, params),
                schedulePage, "warning");

        add(tasks, "urgent", "Yêu cầu đặt lịch khẩn chờ duyệt", "Thêm / đổi / hủy ca của nhân viên đang chờ duyệt",
                count(entityManager, """
                        SELECT COUNT(*) FROM emergency_request er
                        JOIN shift_by_date sbd ON sbd.shift_by_date_id = COALESCE(er.from_shift_assignment_id, er.to_assignment_id)
                        JOIN shift sh ON sh.shift_id = sbd.shift_id
                        WHERE er.status = 'PENDING'""" + storeFilter, params),
                storeManager ? "quanlyca" : "lich", "warning");

        // Ca 7 ngày tới chưa đủ số người tối thiểu (min, không có min hoặc min = 0 thì max)
        add(tasks, "understaffed", "Ca thiếu người trong 7 ngày tới", "Ca chưa đủ số lượng tối thiểu – cần phân bổ thêm nhân viên",
                count(entityManager, """
                        SELECT COUNT(*) FROM shift_by_date sbd
                        JOIN shift sh ON sh.shift_id = sbd.shift_id
                        WHERE sbd.work_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
                          AND COALESCE(sbd.status, '') <> 'CANCELLED'
                          AND COALESCE(NULLIF(sh.min_capacity, 0), sbd.max_capacity, sh.max_capacity, 0) > 0
                          AND (SELECT COUNT(*) FROM shift_assignment a
                               WHERE a.shift_by_date_id = sbd.shift_by_date_id AND a.status NOT IN ('CANCELLED', 'REJECTED'))
                              < COALESCE(NULLIF(sh.min_capacity, 0), sbd.max_capacity, sh.max_capacity, 0)""" + storeFilter, params),
                schedulePage, "info");

        add(tasks, "feedback", "Phản hồi chờ xử lý",
                storeManager ? "Phản hồi của nhân viên gửi tới trưởng cửa hàng" : "Phản hồi bạn có thể xử lý (gồm phản hồi thay trưởng cửa hàng)",
                pendingFeedback(), "phanhoi", "warning");

        if (storeManager) {
            Integer me = currentEmployeeIdOrNull();
            if (me != null) {
                add(tasks, "todo", "Việc chưa hoàn thành", "Todo list của bạn còn việc chưa xong",
                        count(entityManager, """
                                SELECT COUNT(*) FROM todo
                                WHERE assignee_id = :me AND status NOT IN ('DONE', 'COMPLETED', 'CANCELLED')
                                """, Map.of("me", me)),
                        "todo", "info");
            }
        }
    }

    // ------------------------------------------------------------------ Nhân viên

    private void employeeTasks(List<Task> tasks) {
        Integer me = currentEmployeeIdOrNull();
        if (me == null) return;
        Map<String, Object> mine = Map.of("me", me);

        add(tasks, "tomorrow", "Ca làm ngày mai", "Bạn có ca đã được duyệt vào ngày mai",
                count(entityManager, """
                        SELECT COUNT(*) FROM shift_assignment sa
                        JOIN shift_by_date sbd ON sbd.shift_by_date_id = sa.shift_by_date_id
                        WHERE sa.employee_id = :me AND sa.status = 'APPROVED'
                          AND sbd.work_date = DATE_ADD(CURDATE(), INTERVAL 1 DAY)""", mine),
                "lich", "info");

        add(tasks, "registration-open", "Đang mở đăng ký ca", "Có đợt đăng ký ca đang mở tại cửa hàng của bạn",
                count(entityManager, """
                        SELECT COUNT(*) FROM schedule_round r
                        JOIN schedule_period p ON p.schedule_period_id = r.schedule_period_id
                        WHERE p.status = 'OPEN' AND r.status <> 'CLOSED'
                          AND NOW() BETWEEN COALESCE(r.registration_start_at, NOW()) AND COALESCE(r.registration_end_at, NOW())
                          AND (r.store_id IS NULL OR r.store_id IN (
                              SELECT es.store_id FROM employee_store es WHERE es.employee_id = :me AND es.status = 'ACTIVE'))""", mine),
                "dangkyca", "warning");

        add(tasks, "requests-processed", "Yêu cầu vừa được xử lý", "Yêu cầu đăng ký / đặt lịch khẩn được duyệt hoặc từ chối trong 3 ngày qua",
                count(entityManager, """
                        SELECT COUNT(*) FROM emergency_request
                        WHERE employee_id = :me AND status IN ('APPROVED', 'REJECTED')
                          AND processed_at >= DATE_SUB(NOW(), INTERVAL 3 DAY)""", mine),
                "lich", "info");

        add(tasks, "feedback-replied", "Phản hồi của bạn có cập nhật", "Phản hồi bạn gửi được xử lý trong 3 ngày qua",
                count(entityManager, """
                        SELECT COUNT(*) FROM feedback
                        WHERE employee_id = :me AND handled_at >= DATE_SUB(NOW(), INTERVAL 3 DAY)""", mine),
                "feedback", "info");
    }

    // ------------------------------------------------------------------ Tiện ích

    private long pendingFeedback() {
        return feedbackService.countPendingToHandle();
    }

    private Integer currentEmployeeIdOrNull() {
        try {
            return storeScopeService.currentEmployeeId();
        } catch (ApiException exception) {
            return null;
        }
    }

    private static void add(List<Task> tasks, String key, String title, String detail, long count, String page, String tone) {
        if (count > 0) tasks.add(new Task(key, title, detail, count, page, tone));
    }
}
