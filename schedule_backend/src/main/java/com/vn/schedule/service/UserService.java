package com.vn.schedule.service;

import com.vn.schedule.domain.User;
import com.vn.schedule.repository.UserRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.request.UserRequest;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {
    private final UserRepository repository;
    private final AccountGuardService guard;
    public UserService(UserRepository repository, AccountGuardService guard) {
        this.repository = repository;
        this.guard = guard;
    }

    public List<User> findAll() {
        return repository.findAll();
    }

    public User findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public User create(UserRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public User update(Integer id, UserRequest body) {
        User current = findById(id);
        guard.checkStatusChange(current, (String) body.get("status"));
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        // Không có chức năng xóa tài khoản
        findById(id);
        throw guard.deleteNotSupported();
    }

    @Transactional
    public User save(UserRequest body) {
        User entity = toEntity(body);
        if (entity.getId() != null) {
            repository.findById(entity.getId()).ifPresent(current -> guard.checkStatusChange(current, entity.getStatus()));
        }
        return repository.save(entity);
    }

    @Transactional
    public void deleteBody(UserRequest body) {
        throw guard.deleteNotSupported();
    }
    private User toEntity(UserRequest body) {
        User entity = new User();
        entity.setId((Integer) body.get("id"));
        entity.setUsername((String) body.get("username"));
        entity.setPasswordHash((String) body.get("passwordHash"));
        entity.setEmail((String) body.get("email"));
        entity.setPhone((String) body.get("phone"));
        entity.setStatus((String) body.get("status"));
        entity.setLastLoginAt((LocalDateTime) body.get("lastLoginAt"));
        return entity;
    }

    private void applyFields(User entity, UserRequest body) {
        // The path variable is the resource identity. Never overwrite it with
        // an optional request field, especially when a partial update is sent.
        if (body.get("username") != null) {
            entity.setUsername((String) body.get("username"));
        }
        if (body.get("passwordHash") != null) {
            entity.setPasswordHash((String) body.get("passwordHash"));
        }
        if (body.get("email") != null) {
            entity.setEmail((String) body.get("email"));
        }
        if (body.get("phone") != null) {
            entity.setPhone((String) body.get("phone"));
        }
        if (body.get("status") != null) {
            entity.setStatus((String) body.get("status"));
        }
        if (body.get("lastLoginAt") instanceof LocalDateTime lastLoginAt) {
            entity.setLastLoginAt(lastLoginAt);
        }
    }
}
