package com.vn.schedule.config;

import java.util.List;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.HandlerMapping;

import com.vn.schedule.domain.RolePermission;
import com.vn.schedule.domain.User;
import com.vn.schedule.domain.UserRole;
import com.vn.schedule.repository.PermissionRepository;
import com.vn.schedule.repository.RolePermissionRepository;
import com.vn.schedule.repository.UserRepository;
import com.vn.schedule.repository.UserRoleRepository;
import com.vn.schedule.util.SecurityUtil;
import com.vn.schedule.util.error.PermissionException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class PermissionInterceptor implements HandlerInterceptor {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final PermissionRepository permissionRepository;

    public PermissionInterceptor(
            UserRepository userRepository,
            UserRoleRepository userRoleRepository,
            RolePermissionRepository rolePermissionRepository,
            PermissionRepository permissionRepository) {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.rolePermissionRepository = rolePermissionRepository;
        this.permissionRepository = permissionRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean preHandle(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler) throws Exception {
        String path = (String) request.getAttribute(HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE);
        String requestURI = request.getRequestURI();
        String httpMethod = request.getMethod();
        System.out.println(">>> RUN preHandle");
        System.out.println(">>> path= " + path);
        System.out.println(">>> httpMethod= " + httpMethod);
        System.out.println(">>> requestURI= " + requestURI);
        String login = SecurityUtil.getCurrentUserLogin().orElse(null);
        if (login == null || login.isBlank()) {
            return true;
        }

        User user = userRepository.findByUsername(login)
                .or(() -> userRepository.findByEmail(login))
                .orElseThrow(() -> new PermissionException("Tài khoản hiện tại không tồn tại."));

        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new PermissionException("Tài khoản hiện tại đã bị vô hiệu hóa.");
        }

        String routePattern = (String) request.getAttribute(
                HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE);
        String apiPath = request.getContextPath() + (routePattern == null ? "" : routePattern);
        if (apiPath.isBlank()) {
            apiPath = request.getRequestURI();
        }

        List<Integer> roleIds = userRoleRepository.findByUserId(user.getId()).stream()
                .map(UserRole::getRoleId)
                .toList();
        List<Integer> permissionIds = roleIds.isEmpty()
                ? List.of()
                : rolePermissionRepository.findByRoleIdIn(roleIds).stream()
                        .map(RolePermission::getPermissionId)
                        .toList();

        boolean allowed = !permissionIds.isEmpty()
                && permissionRepository.existsByPermissionIdInAndApiPathAndMethod(
                        permissionIds, apiPath, request.getMethod());
        if (!allowed) {
            throw new PermissionException("Bạn không có quyền truy cập endpoint này.");
        }

        return true;
    }
}
