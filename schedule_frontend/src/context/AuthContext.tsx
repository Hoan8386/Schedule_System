"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  AuthConfirmRequest,
  AuthLoginRequest,
  AuthRegisterRequest,
  AuthTokenResponse,
  ResLoginDTO,
  UserLogin,
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
  mockLoginForDemo: (username?: string) => void;
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
        setUser(res.data.user);
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

  const mockLoginForDemo = (username: string = "minhanh") => {
    const mockUser: UserLogin = {
      id: 1,
      username: username || "minhanh",
      email: `${username || "minhanh"}@bloan.vn`,
      phone: "0901234567",
      status: "ACTIVE",
    };
    setUser(mockUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("bloan_user", JSON.stringify(mockUser));
      localStorage.setItem("bloan_access_token", "mock-demo-jwt-token");
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
