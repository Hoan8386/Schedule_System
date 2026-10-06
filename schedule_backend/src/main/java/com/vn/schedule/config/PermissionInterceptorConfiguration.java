package com.vn.schedule.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.vn.schedule.repository.UserRepository;

@Configuration
public class PermissionInterceptorConfiguration implements WebMvcConfigurer {
    @Autowired
    private PermissionInterceptor permissionInterceptor;

    @Bean
    PermissionInterceptor getPermissionInterceptor(UserRepository userRepository) {
        return new PermissionInterceptor(userRepository);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        String[] whiteList = {
                "/", "/api/v1/auth/**",
                "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html",
               
        };
        registry.addInterceptor(permissionInterceptor)
                .excludePathPatterns(whiteList);
    }
}
