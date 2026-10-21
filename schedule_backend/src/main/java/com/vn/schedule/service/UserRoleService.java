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
        guard.checkAssignRole(current.getUserId());
        applyFields(current, body);
        return repository.save(current);
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
