package com.vn.schedule.config;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.HandlerInterceptor;

import com.vn.schedule.domain.User;
import com.vn.schedule.repository.UserRepository;
import com.vn.schedule.util.SecurityUtil;
import com.vn.schedule.util.error.PermissionException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class PermissionInterceptor implements HandlerInterceptor {

    private final UserRepository userRepository;

    public PermissionInterceptor(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public boolean preHandle(
            HttpServletRequest request,
            HttpServletResponse response, Object handler)
            throws Exception {

        String login = SecurityUtil.getCurrentUserLogin().orElse(null);
        if (login != null) {
            User user = userRepository.findByUsername(login)
                    .or(() -> userRepository.findByEmail(login))
                    .orElseThrow(() -> new PermissionException(
                            "Tài khoản hiện tại không tồn tại."));

            if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
                throw new PermissionException("Tài khoản hiện tại đã bị vô hiệu hóa.");
            }
        }
        return true;
    }
}
