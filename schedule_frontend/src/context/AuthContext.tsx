"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserLogin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in on client mount
    try {
      const savedUser = authApi.getSavedUser();
      const token = authApi.getSavedToken();
      if (savedUser && token) {
        const role = (savedUser.roleCode || savedUser.role || "ADMIN") as UserRoleCode;
        savedUser.role = role;
        savedUser.roleCode = role;
        setUser(savedUser);
      }
    } catch (e) {
      console.error("Failed to restore session", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (
    payload: AuthLoginRequest
  ): Promise<ApiResponse<ResLoginDTO>> => {
    setIsLoading(true);
    try {
      const res = await authApi.login(payload);
      if (res.data?.user) {
        const u = res.data.user;
        const roleCode = (u.roleCode || u.role) as UserRoleCode;
        if (roleCode) {
          u.role = roleCode;
          u.roleCode = roleCode;
        } else if (u.roleId === 1) {
          u.role = "ADMIN";
          u.roleCode = "ADMIN";
        } else if (u.roleId === 2) {
          u.role = "MANAGER";
          u.roleCode = "MANAGER";
        } else if (u.roleId === 3) {
          u.role = "STORE_MANAGER";
          u.roleCode = "STORE_MANAGER";
        } else if (u.roleId === 4) {
          u.role = "EMPLOYEE";
          u.roleCode = "EMPLOYEE";
        } else {
          u.role = "ADMIN";
          u.roleCode = "ADMIN";
        }

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
