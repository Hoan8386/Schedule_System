package com.vn.schedule.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AuthTokenResponse {
    private String message;
    private String token;

    public AuthTokenResponse(String message, String token) {
        this.message = message;
        this.token = token;
    }
}