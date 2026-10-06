package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.UserRole;
import com.vn.shopping.domain.UserRoleId;
import com.vn.shopping.repository.UserRoleRepository;
import org.springframework.stereotype.Service;

@Service
public class UserRoleService extends CrudService<UserRole, UserRoleId> {
    public UserRoleService(UserRoleRepository repository, ObjectMapper mapper) {
        super(repository, mapper, UserRole.class);
    }
}


