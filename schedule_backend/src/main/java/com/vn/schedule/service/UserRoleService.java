package com.vn.schedule.service;

import com.vn.schedule.domain.UserRole;
import com.vn.schedule.domain.UserRoleId;
import com.vn.schedule.repository.UserRoleRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.UserRoleRequest;
import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserRoleService {
    private final UserRoleRepository repository;
    public UserRoleService(UserRoleRepository repository) {
        this.repository = repository;
    }

    public List<UserRole> findAll() {
        return repository.findAll();
    }

    public UserRole findById(UserRoleId id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Kh�f´ng t�f¬m tháº¥y báº£n ghi"));
    }

    @Transactional
    public UserRole create(UserRoleRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public UserRole update(UserRoleId id, UserRoleRequest body) {
        UserRole current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(UserRoleId id) {
        repository.delete(findById(id));
    }

    @Transactional
    public UserRole save(UserRoleRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(UserRoleRequest body) {
        repository.delete(toEntity(body));
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
