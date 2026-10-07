import {
  AuthConfirmRequest,
  AuthForgotPasswordRequest,
  AuthLoginRequest,
  AuthRegisterRequest,
  AuthResetPasswordRequest,
  AuthTokenResponse,
  ResLoginDTO,
  RestResponse,
} from "@/types/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export class ApiError extends Error {
  statusCode: number;
  errorField?: string | null;
  serverMessage: string;
  rawDetails?: unknown;

  constructor(
    serverMessage: string,
    statusCode: number = 400,
    errorField?: string | null,
    rawDetails?: unknown
  ) {
    super(serverMessage);
    this.name = "ApiError";
    this.serverMessage = serverMessage;
    this.statusCode = statusCode;
    this.errorField = errorField;
    this.rawDetails = rawDetails;
  }
}

export interface ApiResponse<T> {
  statusCode: number;
  error?: string | null;
  message: string;
  data: T;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json");

  // Attach token if present
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("bloan_access_token");
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const text = await res.text();
    let json: RestResponse<T> | null = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      // Non-JSON response
    }

    if (!res.ok) {
      let displayMessage = "Đã xảy ra lỗi, vui lòng thử lại sau.";
      let errorField: string | null = null;

      if (json) {
        errorField = json.error ?? null;
        if (Array.isArray(json.message)) {
          displayMessage = json.message.join(". ");
        } else if (typeof json.message === "string" && json.message.trim()) {
          displayMessage = json.message;
        } else if (json.error) {
          displayMessage = json.error;
        }
      } else if (text) {
        displayMessage = text;
      }

      throw new ApiError(
        displayMessage,
        res.status,
        errorField,
        json?.message ?? json
      );
    }

    // Success response formatted by FormatRestResponse
    const finalMessage =
      json && typeof json.message === "string"
        ? json.message
        : "Thực hiện thành công";

    const finalData = (json && "data" in json ? json.data : (json as unknown)) as T;

    return {
      statusCode: res.status,
      error: json?.error ?? null,
      message: finalMessage,
      data: finalData,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network or server unreachable
    throw new ApiError(
      "Không thể kết nối đến máy chủ backend (http://localhost:8080). Vui lòng kiểm tra backend đang chạy.",
      503,
      "Service Unavailable"
    );
  }
}

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
        localStorage.setItem("bloan_access_token", res.data.access_token);
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
      localStorage.removeItem("bloan_access_token");
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
    return localStorage.getItem("bloan_access_token");
  },
};
