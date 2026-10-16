import type {
  AuthConfirmRequest,
  AuthForgotPasswordRequest,
  AuthLoginRequest,
  AuthRegisterRequest,
  AuthResetPasswordRequest,
  AuthTokenResponse,
  ResLoginDTO,
} from "@/types/auth";
import { ACCESS_TOKEN_KEY, request, type ApiResponse } from "./http";

/** Đăng nhập, đăng ký, quên mật khẩu và phiên đăng nhập lưu cục bộ. */
export const authApi = {
  // Login: identifier (username or email) + password
  async login(payload: AuthLoginRequest): Promise<ApiResponse<ResLoginDTO>> {
    const identifier = (payload.identifier || payload.username || payload.email || "").trim();
    const isEmail = identifier.includes("@");

    const body = {
      username: isEmail ? "" : identifier,
      email: isEmail ? identifier : "",
      password: payload.password,
    };

    const res = await request<ResLoginDTO>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (typeof window !== "undefined" && res.data) {
      if (res.data.access_token) {
        localStorage.setItem(ACCESS_TOKEN_KEY, res.data.access_token);
        document.cookie = `bloan_access_token=${res.data.access_token}; path=/; max-age=86400; SameSite=Lax`;
      }
      if (res.data.refresh_token) {
        localStorage.setItem("bloan_refresh_token", res.data.refresh_token);
      }
      if (res.data.user) {
        localStorage.setItem("bloan_user", JSON.stringify(res.data.user));
      }
    }

    return res;
  },

  // Register: username, email, phone, password, confirmPassword
  async register(payload: AuthRegisterRequest): Promise<ApiResponse<AuthTokenResponse>> {
    return request<AuthTokenResponse>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Confirm account with token
  async confirm(payload: AuthConfirmRequest): Promise<ApiResponse<void>> {
    return request<void>("/api/v1/auth/confirm", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Refresh token
  async refresh(refreshToken: string): Promise<ApiResponse<ResLoginDTO>> {
    return request<ResLoginDTO>("/api/v1/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  },

  // Forgot password
  async forgotPassword(payload: AuthForgotPasswordRequest): Promise<ApiResponse<AuthTokenResponse>> {
    return request<AuthTokenResponse>("/api/v1/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Reset password
  async resetPassword(payload: AuthResetPasswordRequest): Promise<ApiResponse<void>> {
    return request<void>("/api/v1/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Logout
  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem("bloan_refresh_token");
      localStorage.removeItem("bloan_user");
      document.cookie = "bloan_access_token=; path=/; max-age=0";
    }
  },

  // Get current saved user
  getSavedUser() {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("bloan_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  getSavedToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
};
