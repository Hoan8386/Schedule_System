package com.vn.schedule.service;

import com.vn.schedule.domain.RolePermission;
import com.vn.schedule.domain.RolePermissionId;
import com.vn.schedule.repository.RolePermissionRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.request.RolePermissionRequest;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RolePermissionService {
    private final RolePermissionRepository repository;
    public RolePermissionService(RolePermissionRepository repository) {
        this.repository = repository;
    }

    public List<RolePermission> findAll() {
        return repository.findAll();
    }

    public RolePermission findById(RolePermissionId id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Kh�f´ng t�f¬m tháº¥y báº£n ghi"));
    }

    @Transactional
    public RolePermission create(RolePermissionRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public RolePermission update(RolePermissionId id, RolePermissionRequest body) {
        RolePermission current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(RolePermissionId id) {
        repository.delete(findById(id));
    }

    @Transactional
    public RolePermission save(RolePermissionRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(RolePermissionRequest body) {
        repository.delete(toEntity(body));
    }
    private RolePermission toEntity(RolePermissionRequest body) {
        RolePermission entity = new RolePermission();
        entity.setRoleId((Integer) body.get("roleId"));
        entity.setPermissionId((Integer) body.get("permissionId"));
        return entity;
    }

    private void applyFields(RolePermission entity, RolePermissionRequest body) {
        entity.setRoleId((Integer) body.get("roleId"));
        entity.setPermissionId((Integer) body.get("permissionId"));
    }
}
