package com.vn.schedule.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.schedule.domain.RolePermission;
import com.vn.schedule.domain.RolePermissionId;
import com.vn.schedule.repository.RolePermissionRepository;

import org.springframework.stereotype.Service;

@Service
public class RolePermissionService extends CrudService<RolePermission, RolePermissionId> {
    public RolePermissionService(RolePermissionRepository repository, ObjectMapper mapper) {
        super(repository, mapper, RolePermission.class);
    }
}


