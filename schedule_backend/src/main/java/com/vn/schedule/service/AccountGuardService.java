package com.vn.schedule.service;

import com.vn.schedule.domain.Role;
import com.vn.schedule.domain.User;
import com.vn.schedule.repository.RoleRepository;
import com.vn.schedule.repository.UserRepository;
import com.vn.schedule.repository.UserRoleRepository;
import com.vn.schedule.util.ApiException;

import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

/**
 * Quy tắc bảo vệ tài khoản:
 * - Tài khoản admin không chỉnh được quyền, không khóa được, luôn hoạt động.
 * - Không có chức năng xóa tài khoản.
 * - Luôn có ít nhất 1 tài khoản quản lý (MANAGER) đang hoạt động.
 */
@Service
public class AccountGuardService {
    public static final String ADMIN = "ADMIN";
    public static final String MANAGER = "MANAGER";
    private static final String ACTIVE = "ACTIVE";

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final RoleRepository roleRepository;

    public AccountGuardService(UserRepository userRepository, UserRoleRepository userRoleRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.roleRepository = roleRepository;
    }

    public Set<String> roleCodesOf(Integer userId) {
        if (userId == null) return Set.of();
        return userRoleRepository.findByUserId(userId).stream()
                .map(link -> roleRepository.findById(link.getRoleId()).map(Role::getRoleCode).orElse(null))
                .filter(Objects::nonNull)
                .map(String::toUpperCase)
                .collect(Collectors.toSet());
    }

    public boolean isAdmin(Integer userId) {
        return roleCodesOf(userId).contains(ADMIN);
    }

    private String roleCodeOf(Integer roleId) {
        return roleId == null ? "" : roleRepository.findById(roleId).map(Role::getRoleCode).map(String::toUpperCase).orElse("");
    }

    /** Số tài khoản quản lý đang hoạt động, không tính userId (null = tính tất cả). */
    private long activeManagersExcept(Integer userId) {
        Integer managerRoleId = roleRepository.findByRoleCode(MANAGER).map(Role::getRoleId).orElse(null);
        if (managerRoleId == null) return 0;
        return userRoleRepository.countActiveUsersWithRole(managerRoleId, userId);
    }

    /** Đổi trạng thái tài khoản. */
    public void checkStatusChange(User user, String newStatus) {
        if (newStatus == null || ACTIVE.equalsIgnoreCase(newStatus)) return;
        if (isAdmin(user.getId())) {
            throw bad("Tài khoản admin luôn hoạt động, không thể khóa");
        }
        if (ACTIVE.equalsIgnoreCase(user.getStatus()) && roleCodesOf(user.getId()).contains(MANAGER)
                && activeManagersExcept(user.getId()) == 0) {
            throw bad("Phải luôn có ít nhất 1 tài khoản quản lý đang hoạt động – không thể khóa quản lý cuối cùng");
        }
    }

    /** Gán thêm / đổi vai trò cho tài khoản. */
    public void checkAssignRole(Integer userId) {
        if (isAdmin(userId)) throw bad("Không thể chỉnh quyền của tài khoản admin");
    }

    /** Gỡ vai trò khỏi tài khoản. */
    public void checkRemoveRole(Integer userId, Integer roleId) {
        if (isAdmin(userId)) throw bad("Không thể chỉnh quyền của tài khoản admin");
        if (MANAGER.equals(roleCodeOf(roleId))) {
            User user = userRepository.findById(userId).orElse(null);
            boolean active = user != null && ACTIVE.equalsIgnoreCase(user.getStatus());
            if (active && activeManagersExcept(userId) == 0) {
                throw bad("Phải luôn có ít nhất 1 tài khoản quản lý đang hoạt động – không thể gỡ quyền quản lý cuối cùng");
            }
        }
    }

    public ApiException deleteNotSupported() {
        return bad("Hệ thống không có chức năng xóa tài khoản – hãy khóa tài khoản nếu cần ngừng sử dụng");
    }

    private static ApiException bad(String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, message);
    }
}
