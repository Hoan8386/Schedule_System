package com.vn.schedule.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.schedule.domain.UserRole;
import com.vn.schedule.domain.UserRoleId;
import com.vn.schedule.repository.UserRoleRepository;

import org.springframework.stereotype.Service;

@Service
public class UserRoleService extends CrudService<UserRole, UserRoleId> {
    public UserRoleService(UserRoleRepository repository, ObjectMapper mapper) {
        super(repository, mapper, UserRole.class);
    }
}


