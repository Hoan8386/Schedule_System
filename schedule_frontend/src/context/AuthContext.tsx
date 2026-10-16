"use client";

import React, { createContext, useContext, useState } from "react";
import { useInitialLoad } from "@/lib/hooks";
import {
  AuthConfirmRequest,
  AuthLoginRequest,
  AuthRegisterRequest,
  AuthTokenResponse,
  ResLoginDTO,
  UserLogin,
  UserRoleCode,
} from "@/types/auth";
import { authApi, ApiResponse } from "@/lib/api";

interface AuthContextType {
  user: UserLogin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: AuthLoginRequest) => Promise<ApiResponse<ResLoginDTO>>;
  register: (payload: AuthRegisterRequest) => Promise<ApiResponse<AuthTokenResponse>>;
  confirmAccount: (token: string) => Promise<ApiResponse<void>>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function resolveRole(user: UserLogin): UserRoleCode {
  const roleById: Record<number, UserRoleCode> = {
    1: "ADMIN",
    2: "MANAGER",
    3: "STORE_MANAGER",
    4: "EMPLOYEE",
  };
  const roleFromId = user.roleId ? roleById[Number(user.roleId)] : undefined;
  if (roleFromId) return roleFromId;

  const normalizedRole = String(user.roleCode || user.role || "").trim().toUpperCase();
  if (
    normalizedRole === "ADMIN" ||
    normalizedRole === "MANAGER" ||
    normalizedRole === "STORE_MANAGER" ||
    normalizedRole === "EMPLOYEE"
  ) {
    return normalizedRole;
  }

  return "EMPLOYEE";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserLogin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Khôi phục phiên đăng nhập đã lưu khi mount (chỉ chạy ở client vì cần localStorage)
  useInitialLoad(() => {
    try {
      const savedUser = authApi.getSavedUser();
      const token = authApi.getSavedToken();
      if (savedUser && token) {
        const role = resolveRole(savedUser);
        savedUser.role = role;
        savedUser.roleCode = role;
        setUser(savedUser);
      }
    } catch (e) {
      console.error("Failed to restore session", e);
    } finally {
      setIsLoading(false);
    }
  });

  const login = async (
    payload: AuthLoginRequest
  ): Promise<ApiResponse<ResLoginDTO>> => {
    setIsLoading(true);
    try {
      const res = await authApi.login(payload);
      if (res.data?.user) {
        const u = res.data.user;
        const roleCode = resolveRole(u);
        u.role = roleCode;
        u.roleCode = roleCode;

        if (!u.roleName) {
          if (u.role === "ADMIN") u.roleName = "Quản trị viên";
          else if (u.role === "MANAGER") u.roleName = "Quản lý";
          else if (u.role === "STORE_MANAGER") u.roleName = "Trưởng cửa hàng";
          else if (u.role === "EMPLOYEE") u.roleName = "Nhân viên";
        }

        if (typeof window !== "undefined") {
          localStorage.setItem("bloan_user", JSON.stringify(u));
        }

        setUser(u);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    payload: AuthRegisterRequest
  ): Promise<ApiResponse<AuthTokenResponse>> => {
    return await authApi.register(payload);
  };

  const confirmAccount = async (token: string): Promise<ApiResponse<void>> => {
    const payload: AuthConfirmRequest = { token };
    return await authApi.confirm(payload);
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        confirmAccount,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
