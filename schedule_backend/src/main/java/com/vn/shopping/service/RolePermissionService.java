package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.RolePermission;
import com.vn.shopping.domain.RolePermissionId;
import com.vn.shopping.repository.RolePermissionRepository;
import org.springframework.stereotype.Service;

@Service
public class RolePermissionService extends CrudService<RolePermission, RolePermissionId> {
    public RolePermissionService(RolePermissionRepository repository, ObjectMapper mapper) {
        super(repository, mapper, RolePermission.class);
    }
}


