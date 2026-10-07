package com.vn.schedule.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthConfirmRequest {
    @NotBlank(message = "Confirmation token không được để trống")
    private String token;
}
