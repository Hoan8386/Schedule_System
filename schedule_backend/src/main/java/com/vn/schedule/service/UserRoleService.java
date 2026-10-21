package com.vn.schedule.service;

import com.vn.schedule.domain.UserRole;
import com.vn.schedule.domain.UserRoleId;
import com.vn.schedule.repository.UserRoleRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.request.UserRoleRequest;
import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserRoleService {
    private final UserRoleRepository repository;
    private final AccountGuardService guard;
    public UserRoleService(UserRoleRepository repository, AccountGuardService guard) {
        this.repository = repository;
        this.guard = guard;
    }

    public List<UserRole> findAll() {
        return repository.findAll();
    }

    public UserRole findById(UserRoleId id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public UserRole create(UserRoleRequest body) {
        UserRole entity = toEntity(body);
        guard.checkAssignRole(entity.getUserId());
        return repository.save(entity);
    }

    @Transactional
    public UserRole update(UserRoleId id, UserRoleRequest body) {
        UserRole current = findById(id);
        UserRole next = toEntity(body);
        guard.checkAssignRole(current.getUserId());
        guard.checkAssignRole(next.getUserId());
        boolean keyChanged = !java.util.Objects.equals(current.getUserId(), next.getUserId())
                || !java.util.Objects.equals(current.getRoleId(), next.getRoleId());
        if (!keyChanged) {
            applyFields(current, body);
            return repository.save(current);
        }
        // Đổi người / đổi vai trò = gỡ liên kết cũ rồi gán liên kết mới (khóa chính ghép không sửa tại chỗ được)
        guard.checkRemoveRole(current.getUserId(), current.getRoleId());
        repository.delete(current);
        repository.flush();
        return repository.save(next);
    }

    /**
     * Đổi vai trò của tài khoản trong một giao dịch: gỡ mọi vai trò khác rồi gán vai trò mới
     * (tài khoản chưa có vai trò nào thì chỉ gán). Một bước thất bại thì không thay đổi gì.
     */
    @Transactional
    public UserRole changeRole(Integer userId, Integer roleId) {
        if (userId == null || roleId == null) throw new ApiException(HttpStatus.BAD_REQUEST, "Thiếu tài khoản hoặc vai trò");
        guard.checkAssignRole(userId);
        UserRole kept = null;
        for (UserRole link : repository.findByUserId(userId)) {
            if (roleId.equals(link.getRoleId())) {
                kept = link;
                continue;
            }
            guard.checkRemoveRole(link.getUserId(), link.getRoleId());
            repository.delete(link);
        }
        if (kept != null) return kept;
        UserRole entity = new UserRole();
        entity.setUserId(userId);
        entity.setRoleId(roleId);
        entity.setAssignedAt(LocalDateTime.now());
        return repository.save(entity);
    }

    @Transactional
    public void delete(UserRoleId id) {
        UserRole current = findById(id);
        guard.checkRemoveRole(current.getUserId(), current.getRoleId());
        repository.delete(current);
    }

    @Transactional
    public UserRole save(UserRoleRequest body) {
        UserRole entity = toEntity(body);
        guard.checkAssignRole(entity.getUserId());
        return repository.save(entity);
    }

    @Transactional
    public void deleteBody(UserRoleRequest body) {
        UserRole entity = toEntity(body);
        guard.checkRemoveRole(entity.getUserId(), entity.getRoleId());
        repository.delete(entity);
    }
    private UserRole toEntity(UserRoleRequest body) {
        UserRole entity = new UserRole();
        entity.setUserId((Integer) body.get("userId"));
        entity.setRoleId((Integer) body.get("roleId"));
        entity.setAssignedBy((Integer) body.get("assignedBy"));
        entity.setAssignedAt((LocalDateTime) body.get("assignedAt"));
        return entity;
    }

    private void applyFields(UserRole entity, UserRoleRequest body) {
        entity.setUserId((Integer) body.get("userId"));
        entity.setRoleId((Integer) body.get("roleId"));
        entity.setAssignedBy((Integer) body.get("assignedBy"));
        entity.setAssignedAt((LocalDateTime) body.get("assignedAt"));
    }
}
