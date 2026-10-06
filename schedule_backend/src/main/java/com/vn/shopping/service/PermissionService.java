package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.Permission;
import com.vn.shopping.repository.PermissionRepository;
import org.springframework.stereotype.Service;

@Service
public class PermissionService extends CrudService<Permission, Integer> {
    public PermissionService(PermissionRepository repository, ObjectMapper mapper) {
        super(repository, mapper, Permission.class);
    }
}
