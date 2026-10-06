package com.vn.schedule.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.schedule.domain.Permission;
import com.vn.schedule.repository.PermissionRepository;

import org.springframework.stereotype.Service;

@Service
public class PermissionService extends CrudService<Permission, Integer> {
    public PermissionService(PermissionRepository repository, ObjectMapper mapper) {
        super(repository, mapper, Permission.class);
    }
}
