package com.vn.schedule.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthRefreshRequest {
    @NotBlank(message = "Refresh token không được để trống")
    private String refreshToken;
}
