package com.vn.schedule.controller;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vn.schedule.domain.User;
import com.vn.schedule.dto.*;
import com.vn.schedule.dto.response.ResLoginDTO;
import com.vn.schedule.service.AuthService;
import com.vn.schedule.util.anotation.ApiMessage;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    @ApiMessage("Đăng ký thành công, vui lòng xác nhận tài khoản")
    public ResponseEntity<AuthTokenResponse> register(@Valid @RequestBody AuthRegisterRequest request) {
        User user = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthTokenResponse("Đăng ký thành công, vui lòng xác nhận tài khoản",
                        authService.confirmationToken(user)));
    }

    @PostMapping("/confirm")
    @ApiMessage("Xác nhận tài khoản thành công")
    public ResponseEntity<Void> confirm(@Valid @RequestBody AuthConfirmRequest request) {
        authService.confirm(request.getToken());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    @ApiMessage("Đăng nhập thành công")
    public ResponseEntity<ResLoginDTO> login(@Valid @RequestBody AuthLoginRequest request) {
        return ResponseEntity.ok(authService.login(request.identifier(), request.getPassword()));
    }

    @PostMapping("/refresh")
    @ApiMessage("Làm mới token thành công")
    public ResponseEntity<ResLoginDTO> refresh(@Valid @RequestBody AuthRefreshRequest request) {
        return ResponseEntity.ok(authService.refresh(request.getRefreshToken()));
    }

    @PostMapping("/forgot-password")
    @ApiMessage("Đã tạo yêu cầu đặt lại mật khẩu")
    public ResponseEntity<AuthTokenResponse> forgotPassword(
            @Valid @RequestBody AuthForgotPasswordRequest request) {
        return ResponseEntity.ok(new AuthTokenResponse("Đã tạo yêu cầu đặt lại mật khẩu",
                authService.forgotPassword(request.getEmail())));
    }

    @PostMapping("/reset-password")
    @ApiMessage("Đặt lại mật khẩu thành công")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody AuthResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok().build();
    }
}
