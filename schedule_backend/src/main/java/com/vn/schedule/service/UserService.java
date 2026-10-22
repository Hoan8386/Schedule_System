package com.vn.schedule.service;

import com.vn.schedule.domain.Role;
import com.vn.schedule.domain.User;
import com.vn.schedule.dto.response.AccountPageResponse;
import com.vn.schedule.repository.UserRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.util.PageSupport;
import com.vn.schedule.dto.request.UserRequest;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

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

    private static final Map<String, Sort> ACCOUNT_SORTS = Map.of(
            "newest", Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id")),
            "username", Sort.by(Sort.Order.asc("username"), Sort.Order.asc("id")),
            "lastLogin", Sort.by(Sort.Order.desc("lastLoginAt"), Sort.Order.desc("id")));

    /** Trang tài khoản: tìm kiếm, lọc vai trò / trạng thái, phân trang và đếm tổng tại DB trong 3 truy vấn. */
    @Transactional(readOnly = true)
    public AccountPageResponse accounts(Integer page, Integer size, String sort, String query, String role, String status) {
        Pageable pageable = PageSupport.pageable(page, size, sort, ACCOUNT_SORTS, "newest");
        String roleCode = role == null || role.isBlank() || "ALL".equalsIgnoreCase(role) ? null : role.trim().toUpperCase();
        Boolean locked = status == null || status.isBlank() || "ALL".equalsIgnoreCase(status) ? null
                : !"ACTIVE".equalsIgnoreCase(status.trim());
        Page<Object[]> rows = repository.searchAccounts(PageSupport.keyword(query), locked, roleCode, pageable);
        List<AccountPageResponse.Item> items = rows.getContent().stream().map(row -> {
            User user = (User) row[0];
            Role userRole = (Role) row[1];
            return new AccountPageResponse.Item(user.getId(), user.getUsername(), user.getEmail(), user.getPhone(),
                    user.getStatus(), user.getLastLoginAt(), user.getCreatedAt(),
                    userRole == null ? null : userRole.getRoleId(),
                    userRole == null ? null : userRole.getRoleCode(),
                    userRole == null ? null : userRole.getRoleName());
        }).toList();
        Object[] counts = repository.accountSummary().get(0);
        return new AccountPageResponse(PageSupport.meta(rows), items, new AccountPageResponse.Summary(
                number(counts[0]), number(counts[1]), number(counts[2]), number(counts[3]), number(counts[4])));
    }

    private static long number(Object value) {
        return value instanceof Number number ? number.longValue() : 0;
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
