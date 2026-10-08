package com.vn.schedule.service;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vn.schedule.domain.User;
import com.vn.schedule.dto.request.AuthRegisterRequest;
import com.vn.schedule.dto.request.AuthResetPasswordRequest;
import com.vn.schedule.dto.response.ResLoginDTO;
import com.vn.schedule.repository.UserRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.util.SecurityUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityUtil securityUtil;

    @Transactional
    public User register(AuthRegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Mật khẩu xác nhận không khớp");
        }
        if (userRepository.findByUsername(request.getUsername().trim()).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "Username đã tồn tại");
        }
        if (userRepository.findByEmail(request.getEmail().trim()).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "Email đã tồn tại");
        }
        if (request.getPhone() != null && !request.getPhone().isBlank()
                && userRepository.findByPhone(request.getPhone().trim()).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "Số điện thoại đã tồn tại");
        }

        User user = new User();
        user.setUsername(request.getUsername().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPhone(request.getPhone() == null || request.getPhone().isBlank()
                ? null : request.getPhone().trim());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setStatus("PENDING");
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    @Transactional
    public ResLoginDTO login(String identifier, String password) {
        if (identifier == null || identifier.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Username hoặc email không được để trống");
        }
        User user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier.toLowerCase()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Sai tài khoản hoặc mật khẩu"));
        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Tài khoản chưa được kích hoạt hoặc đã bị khóa");
        }
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Sai tài khoản hoặc mật khẩu");
        }

        user.setLastLoginAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        return tokens(user);
    }

    public ResLoginDTO refresh(String refreshToken) {
        String email = securityUtil.checkValidRefreshToken(refreshToken).getSubject();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Refresh token không hợp lệ"));
        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Tài khoản chưa được kích hoạt hoặc đã bị khóa");
        }
        return tokens(user);
    }

    @Transactional
    public void confirm(String token) {
        String email = securityUtil.checkValidConfirmationToken(token).getSubject();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản"));
        user.setStatus("ACTIVE");
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    public String forgotPassword(String email) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản với email này"));
        return securityUtil.createPasswordResetToken(user.getEmail());
    }

    @Transactional
    public void resetPassword(AuthResetPasswordRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Mật khẩu xác nhận không khớp");
        }
        String email = securityUtil.checkValidPasswordResetToken(request.getToken()).getSubject();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản"));
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    public String confirmationToken(User user) {
        return securityUtil.createConfirmationToken(user.getEmail());
    }

    private ResLoginDTO tokens(User user) {
        ResLoginDTO dto = new ResLoginDTO();
        dto.setUser(new ResLoginDTO.UserLogin(user.getId(), user.getUsername(), user.getEmail(),
                user.getPhone(), user.getStatus()));
        dto.setAccessToken(securityUtil.createAccessToken(user.getEmail(), dto));
        dto.setRefreshToken(securityUtil.createRefreshToken(user.getEmail(), dto));
        return dto;
    }
}
