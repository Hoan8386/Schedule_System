package com.vn.schedule.service;

import com.vn.schedule.domain.Permission;
import com.vn.schedule.repository.PermissionRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.PermissionRequest;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PermissionService {
    private final PermissionRepository repository;
    public PermissionService(PermissionRepository repository) {
        this.repository = repository;
    }

    public List<Permission> findAll() {
        return repository.findAll();
    }

    public Permission findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public Permission create(PermissionRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public Permission update(Integer id, PermissionRequest body) {
        Permission current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public Permission save(PermissionRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(PermissionRequest body) {
        repository.delete(toEntity(body));
    }
    private Permission toEntity(PermissionRequest body) {
        Permission entity = new Permission();
        entity.setPermissionId((Integer) body.get("permissionId"));
        entity.setPermissionCode((String) body.get("permissionCode"));
        entity.setPermissionName((String) body.get("permissionName"));
        entity.setDescription((String) body.get("description"));
        return entity;
    }

    private void applyFields(Permission entity, PermissionRequest body) {
        entity.setPermissionId((Integer) body.get("permissionId"));
        entity.setPermissionCode((String) body.get("permissionCode"));
        entity.setPermissionName((String) body.get("permissionName"));
        entity.setDescription((String) body.get("description"));
    }
}
