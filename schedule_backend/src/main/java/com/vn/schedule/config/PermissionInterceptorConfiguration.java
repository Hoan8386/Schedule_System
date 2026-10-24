package com.vn.schedule.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class PermissionInterceptorConfiguration implements WebMvcConfigurer {

    private final PermissionInterceptor permissionInterceptor;

    public PermissionInterceptorConfiguration(PermissionInterceptor permissionInterceptor) {
        this.permissionInterceptor = permissionInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        String[] whiteList = {
                "/",
                "/api/v1/auth/**",
                "/v3/api-docs/**",
                "/swagger-ui/**",
                "/swagger-ui.html",
                "/api/v1/attachment/file/**",
                // Thông báo cá nhân: mọi vai trò đã đăng nhập đều dùng (dữ liệu chỉ của chính người đó)
                "/api/v1/notification/me",
                "/api/v1/notification/me/**",
                // Lần đầu database trống chưa có bảng quyền – DatabaseController tự kiểm tra quyền
                "/api/v1/database/**"
        };

        registry.addInterceptor(permissionInterceptor)
                .excludePathPatterns(whiteList);
    }
}