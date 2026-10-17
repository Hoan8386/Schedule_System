package com.vn.schedule.service;

import com.vn.schedule.domain.Notification;
import com.vn.schedule.repository.NotificationRepository;
import com.vn.schedule.util.ApiException;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static com.vn.schedule.util.SqlValues.*;

/**
 * Phát thông báo trong ứng dụng tới nhân sự. Mỗi người nhận có một bản ghi notification;
 * các bản ghi cùng một lần phát có source_type = BROADCAST và chung source_id (mã đợt phát).
 */
@Service
public class BroadcastService {
    public static final String SOURCE_TYPE = "BROADCAST";
    private static final Set<String> AUDIENCES = Set.of("ALL", "SHIFT_TODAY", "STORE_MANAGERS");
    private static final Set<String> PRIORITIES = Set.of("NORMAL", "HIGH", "URGENT");

    private final NotificationRepository notificationRepository;
    private final StoreScopeService storeScopeService;

    @PersistenceContext
    private EntityManager entityManager;

    public BroadcastService(NotificationRepository notificationRepository, StoreScopeService storeScopeService) {
        this.notificationRepository = notificationRepository;
        this.storeScopeService = storeScopeService;
    }

    public record StoreOption(Integer storeId, String storeName) {
    }

    /** Số người nhận theo từng đối tượng (ALL / SHIFT_TODAY / STORE_MANAGERS) trong phạm vi đã chọn. */
    public record Audiences(boolean global, List<StoreOption> stores, Map<String, Integer> counts) {
    }

    public record BroadcastRequest(String audience, Integer storeId, String title, String content, String priority) {
    }

    public record BroadcastResult(Integer batchId, int recipients) {
    }

    public record BroadcastHistory(Integer batchId, String title, String content, String priority, String sentAt,
                                   long recipients, long readCount) {
    }

    @Transactional(readOnly = true)
    public Audiences audiences(Integer storeId) {
        Collection<Integer> storeIds = scopeStoreIds(storeId);
        Integer me = currentEmployeeIdOrNull();
        Map<String, Integer> counts = new LinkedHashMap<>();
        for (String audience : List.of("ALL", "SHIFT_TODAY", "STORE_MANAGERS")) {
            counts.put(audience, recipients(audience, storeIds, me).size());
        }
        return new Audiences(storeScopeService.isGlobalUser(), stores(), counts);
    }

    @Transactional
    public BroadcastResult broadcast(BroadcastRequest body) {
        String audience = body.audience() == null ? "ALL" : body.audience().trim().toUpperCase();
        if (!AUDIENCES.contains(audience)) throw bad("Đối tượng nhận không hợp lệ");
        String priority = body.priority() == null ? "NORMAL" : body.priority().trim().toUpperCase();
        if (!PRIORITIES.contains(priority)) throw bad("Mức độ ưu tiên không hợp lệ");
        String title = body.title() == null ? "" : body.title().trim();
        String content = body.content() == null ? "" : body.content().trim();
        if (title.isEmpty() || content.isEmpty()) throw bad("Vui lòng nhập tiêu đề và nội dung thông báo");
        if (title.length() > 255) throw bad("Tiêu đề tối đa 255 ký tự");

        Integer me = currentEmployeeIdOrNull();
        Set<Integer> recipients = recipients(audience, scopeStoreIds(body.storeId()), me);
        if (recipients.isEmpty()) throw bad("Không có nhân viên nào thuộc đối tượng đã chọn");

        Integer batchId = (int) count(entityManager,
                "SELECT COALESCE(MAX(source_id), 0) + 1 FROM notification WHERE source_type = :type",
                Map.of("type", SOURCE_TYPE));
        LocalDateTime now = LocalDateTime.now();
        List<Notification> items = new ArrayList<>();
        for (Integer employeeId : recipients) {
            Notification item = new Notification();
            item.setEmployeeId(employeeId);
            item.setTitle(title);
            item.setContent(content);
            item.setNotificationType("BROADCAST_" + priority);
            item.setSourceType(SOURCE_TYPE);
            item.setSourceId(batchId);
            item.setIsRead(false);
            item.setCreatedAt(now);
            items.add(item);
        }
        notificationRepository.saveAll(items);
        return new BroadcastResult(batchId, items.size());
    }

    /** Các đợt phát gần đây (trong phạm vi cửa hàng người xem quản lý), kèm số người đã đọc. */
    @Transactional(readOnly = true)
    public List<BroadcastHistory> history(int limit) {
        Collection<Integer> storeIds = scopeStoreIds(null);
        Map<String, Object> params = new HashMap<>();
        params.put("type", SOURCE_TYPE);
        String scope = "";
        if (storeIds != null) {
            // Trưởng cửa hàng chỉ thấy đợt phát có người nhận thuộc cửa hàng mình
            scope = " AND n.employee_id IN (SELECT es.employee_id FROM employee_store es WHERE es.store_id IN (:storeIds))";
            params.put("storeIds", storeIds.isEmpty() ? List.of(-1) : storeIds);
        }
        return rows(entityManager, """
                SELECT n.source_id, MAX(n.title), MAX(n.content), MAX(n.notification_type), MIN(n.created_at),
                       COUNT(*), SUM(CASE WHEN n.is_read = TRUE THEN 1 ELSE 0 END)
                FROM notification n
                WHERE n.source_type = :type
                """ + scope + " GROUP BY n.source_id ORDER BY MIN(n.created_at) DESC LIMIT " + Math.max(1, Math.min(limit, 50)),
                params).stream()
                .map(row -> new BroadcastHistory(toInt(row[0]), text(row[1]), text(row[2]),
                        text(row[3]) == null ? "NORMAL" : text(row[3]).replace("BROADCAST_", ""),
                        formatDateTime(row[4]), toLong(row[5]), toLong(row[6])))
                .toList();
    }

    // ------------------------------------------------------------------ Người nhận

    /** Tập employee_id đang làm việc thuộc đối tượng; storeIds = null nghĩa là toàn chuỗi. Bỏ người gửi. */
    private Set<Integer> recipients(String audience, Collection<Integer> storeIds, Integer sender) {
        if (storeIds != null && storeIds.isEmpty()) return Set.of();
        Map<String, Object> params = new HashMap<>();
        String storeFilter = "";
        if (storeIds != null) params.put("storeIds", storeIds);

        String sql = switch (audience) {
            case "SHIFT_TODAY" -> {
                params.put("today", LocalDate.now());
                if (storeIds != null) storeFilter = " AND sh.store_id IN (:storeIds)";
                yield """
                        SELECT DISTINCT e.employee_id
                        FROM shift_assignment sa
                        JOIN shift_by_date sbd ON sbd.shift_by_date_id = sa.shift_by_date_id
                        JOIN shift sh ON sh.shift_id = sbd.shift_id
                        JOIN employee e ON e.employee_id = sa.employee_id
                        WHERE sbd.work_date = :today AND sa.status IN ('APPROVED', 'COMPLETED')
                          AND (e.status IS NULL OR e.status = 'ACTIVE')
                        """ + storeFilter;
            }
            case "STORE_MANAGERS" -> {
                if (storeIds != null) storeFilter = " AND sm.store_id IN (:storeIds)";
                yield """
                        SELECT DISTINCT e.employee_id
                        FROM store_manager sm
                        JOIN employee e ON e.employee_id = sm.employee_id
                        WHERE sm.status = 'ACTIVE' AND (e.status IS NULL OR e.status = 'ACTIVE')
                        """ + storeFilter;
            }
            default -> storeIds == null
                    ? "SELECT e.employee_id FROM employee e WHERE e.status IS NULL OR e.status = 'ACTIVE'"
                    : """
                    SELECT DISTINCT e.employee_id
                    FROM employee_store es
                    JOIN employee e ON e.employee_id = es.employee_id
                    WHERE es.status = 'ACTIVE' AND es.store_id IN (:storeIds)
                      AND (e.status IS NULL OR e.status = 'ACTIVE')
                    """;
        };

        Set<Integer> result = new LinkedHashSet<>();
        rows(entityManager, sql, params).forEach(row -> result.add(toInt(row[0])));
        if (sender != null) result.remove(sender);
        return result;
    }

    /** storeId được chọn (phải thuộc phạm vi) hoặc mọi cửa hàng trong phạm vi; null = toàn chuỗi. */
    private Collection<Integer> scopeStoreIds(Integer storeId) {
        if (storeId != null) {
            storeScopeService.requireStoreAccess(storeId);
            return List.of(storeId);
        }
        Set<Integer> visible = storeScopeService.visibleStoreIds();
        return visible == null ? null : visible;
    }

    private List<StoreOption> stores() {
        Set<Integer> visible = storeScopeService.visibleStoreIds();
        if (visible != null && visible.isEmpty()) return List.of();
        Map<String, Object> params = new HashMap<>();
        String filter = "";
        if (visible != null) {
            filter = " WHERE store_id IN (:ids)";
            params.put("ids", visible);
        }
        return rows(entityManager, "SELECT store_id, store_name FROM store" + filter + " ORDER BY store_name", params).stream()
                .map(row -> new StoreOption(toInt(row[0]), text(row[1])))
                .toList();
    }

    private Integer currentEmployeeIdOrNull() {
        try {
            return storeScopeService.currentEmployeeId();
        } catch (ApiException ex) {
            return null;
        }
    }

    private static ApiException bad(String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, message);
    }
}
