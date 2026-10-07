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
  mockLoginForDemo: (username?: string, role?: UserRoleCode) => void;
  switchRole: (role: UserRoleCode) => void;
}

const mockProfiles: Record<UserRoleCode, UserLogin> = {
  ADMIN: {
    id: 1,
    username: "admin",
    email: "admin@bloan.vn",
    phone: "0901234567",
    status: "ACTIVE",
    role: "ADMIN",
    roleCode: "ADMIN",
    roleId: 1,
    roleName: "Quản trị viên",
    fullName: "Quản trị viên Hệ thống",
  },
  MANAGER: {
    id: 2,
    username: "manager",
    email: "manager@bloan.vn",
    phone: "0902345678",
    status: "ACTIVE",
    role: "MANAGER",
    roleCode: "MANAGER",
    roleId: 2,
    roleName: "Quản lý chuỗi",
    fullName: "Nguyễn Hải Đăng",
  },
  STORE_MANAGER: {
    id: 3,
    username: "thuha.ch001",
    email: "thuha@bloan.vn",
    phone: "0903456789",
    status: "ACTIVE",
    role: "STORE_MANAGER",
    roleCode: "STORE_MANAGER",
    roleId: 3,
    roleName: "Trưởng cửa hàng",
    fullName: "Trần Thu Hà",
    storeName: "BLOAN · Nguyễn Trãi",
    storeCode: "CH001",
  },
  EMPLOYEE: {
    id: 4,
    username: "minhanh.nv024",
    email: "minhanh.nv024@bloan.vn",
    phone: "0903246810",
    status: "ACTIVE",
    role: "EMPLOYEE",
    roleCode: "EMPLOYEE",
    roleId: 4,
    roleName: "Nhân viên bán hàng",
    fullName: "Nguyễn Minh Anh",
    storeName: "BLOAN · Nguyễn Trãi",
    storeCode: "NV024",
  },
};

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

  const mockLoginForDemo = (username?: string, role: UserRoleCode = "ADMIN") => {
    const profile = mockProfiles[role];
    const mockUser: UserLogin = {
      ...profile,
      username: username || profile.username,
    };
    setUser(mockUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("bloan_user", JSON.stringify(mockUser));
      localStorage.setItem("bloan_access_token", "mock-demo-jwt-token");
    }
  };

  const switchRole = (role: UserRoleCode) => {
    const profile = mockProfiles[role];
    setUser(profile);
    if (typeof window !== "undefined") {
      localStorage.setItem("bloan_user", JSON.stringify(profile));
    }
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
        mockLoginForDemo,
        switchRole,
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
