package com.vn.schedule.service;

import com.vn.schedule.domain.Notification;
import com.vn.schedule.repository.NotificationRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.request.NotificationRequest;
import java.time.LocalDateTime;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.SliceImpl;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {
    /** Số thông báo tối đa trả về mỗi lần để hạn chế tải dữ liệu. */
    public static final int MAX_PAGE_SIZE = 20;

    private final NotificationRepository repository;
    private final StoreScopeService storeScopeService;

    public NotificationService(NotificationRepository repository, StoreScopeService storeScopeService) {
        this.repository = repository;
        this.storeScopeService = storeScopeService;
    }

    // ---------- Thông báo của người dùng đang đăng nhập ----------

    /** Nhân viên của tài khoản hiện tại; null nếu tài khoản chưa có hồ sơ nhân viên (vd. ADMIN). */
    private Integer currentEmployeeIdOrNull() {
        try {
            return storeScopeService.currentEmployeeId();
        } catch (ApiException ex) {
            if (ex.status() == HttpStatus.FORBIDDEN) {
                return null;
            }
            throw ex;
        }
    }

    @Transactional(readOnly = true)
    public Slice<Notification> findMine(boolean read, int page, int size) {
        Integer employeeId = currentEmployeeIdOrNull();
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), MAX_PAGE_SIZE));
        if (employeeId == null) {
            return new SliceImpl<>(List.of(), pageable, false);
        }
        return repository.findByEmployeeAndReadState(employeeId, read, pageable);
    }

    @Transactional(readOnly = true)
    public long countMyUnread() {
        Integer employeeId = currentEmployeeIdOrNull();
        return employeeId == null ? 0 : repository.countUnread(employeeId);
    }

    @Transactional
    public Notification markMineAsRead(Integer id) {
        Notification notification = findById(id);
        Integer employeeId = currentEmployeeIdOrNull();
        if (employeeId == null || !employeeId.equals(notification.getEmployeeId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Bạn chỉ được thao tác trên thông báo của mình");
        }
        if (!Boolean.TRUE.equals(notification.getIsRead())) {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
        }
        return repository.save(notification);
    }

    @Transactional
    public int markAllMineAsRead() {
        Integer employeeId = currentEmployeeIdOrNull();
        return employeeId == null ? 0 : repository.markAllRead(employeeId, LocalDateTime.now());
    }

    // ---------- CRUD quản trị ----------

    public List<Notification> findAll() {
        return repository.findAll();
    }

    public Notification findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public Notification create(NotificationRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public Notification update(Integer id, NotificationRequest body) {
        Notification current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public Notification save(NotificationRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(NotificationRequest body) {
        repository.delete(toEntity(body));
    }
    private Notification toEntity(NotificationRequest body) {
        Notification entity = new Notification();
        entity.setNotificationId((Integer) body.get("notificationId"));
        entity.setEmployeeId((Integer) body.get("employeeId"));
        entity.setNotificationTemplateId((Integer) body.get("notificationTemplateId"));
        entity.setTitle((String) body.get("title"));
        entity.setContent((String) body.get("content"));
        entity.setNotificationType((String) body.get("notificationType"));
        entity.setSourceType((String) body.get("sourceType"));
        entity.setSourceId((Integer) body.get("sourceId"));
        entity.setIsRead((Boolean) body.get("isRead"));
        entity.setReadAt((LocalDateTime) body.get("readAt"));
        return entity;
    }

    private void applyFields(Notification entity, NotificationRequest body) {
        entity.setNotificationId((Integer) body.get("notificationId"));
        entity.setEmployeeId((Integer) body.get("employeeId"));
        entity.setNotificationTemplateId((Integer) body.get("notificationTemplateId"));
        entity.setTitle((String) body.get("title"));
        entity.setContent((String) body.get("content"));
        entity.setNotificationType((String) body.get("notificationType"));
        entity.setSourceType((String) body.get("sourceType"));
        entity.setSourceId((Integer) body.get("sourceId"));
        entity.setIsRead((Boolean) body.get("isRead"));
        entity.setReadAt((LocalDateTime) body.get("readAt"));
    }
}
