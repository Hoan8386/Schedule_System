package com.vn.schedule.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.schedule.domain.Role;
import com.vn.schedule.repository.RoleRepository;

import org.springframework.stereotype.Service;

@Service
public class RoleService extends CrudService<Role, Integer> {
    public RoleService(RoleRepository repository, ObjectMapper mapper) {
        super(repository, mapper, Role.class);
    }
}
