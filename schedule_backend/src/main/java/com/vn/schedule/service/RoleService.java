package com.vn.schedule.service;

import com.vn.schedule.domain.Role;
import com.vn.schedule.repository.RoleRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.request.RoleRequest;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RoleService {
    private final RoleRepository repository;
    public RoleService(RoleRepository repository) {
        this.repository = repository;
    }

    public List<Role> findAll() {
        return repository.findAll();
    }

    public Role findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public Role create(RoleRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public Role update(Integer id, RoleRequest body) {
        Role current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public Role save(RoleRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(RoleRequest body) {
        repository.delete(toEntity(body));
    }
    private Role toEntity(RoleRequest body) {
        Role entity = new Role();
        entity.setRoleId((Integer) body.get("roleId"));
        entity.setRoleCode((String) body.get("roleCode"));
        entity.setRoleName((String) body.get("roleName"));
        entity.setDescription((String) body.get("description"));
        entity.setStatus((String) body.get("status"));
        return entity;
    }

    private void applyFields(Role entity, RoleRequest body) {
        entity.setRoleId((Integer) body.get("roleId"));
        entity.setRoleCode((String) body.get("roleCode"));
        entity.setRoleName((String) body.get("roleName"));
        entity.setDescription((String) body.get("description"));
        entity.setStatus((String) body.get("status"));
    }
}
