package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.Role;
import com.vn.shopping.repository.RoleRepository;
import org.springframework.stereotype.Service;

@Service
public class RoleService extends CrudService<Role, Integer> {
    public RoleService(RoleRepository repository, ObjectMapper mapper) {
        super(repository, mapper, Role.class);
    }
}
