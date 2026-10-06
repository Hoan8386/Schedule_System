package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.User;
import com.vn.shopping.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService extends CrudService<User, Integer> {
    public UserService(UserRepository repository, ObjectMapper mapper) {
        super(repository, mapper, User.class);
    }
}
