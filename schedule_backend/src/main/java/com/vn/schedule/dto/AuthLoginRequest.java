package com.vn.schedule.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthLoginRequest {
    private String username;
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;

    public String identifier() {
        String value = username != null && !username.isBlank() ? username : email;
        return value == null ? "" : value.trim();
    }
}
