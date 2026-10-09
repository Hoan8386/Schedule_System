"use client";

import React, { useState } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import ForgotPasswordModal from "@/components/auth/ForgotPasswordModal";
import AdminLayout from "@/components/admin/AdminLayout";
import ManagementLayout from "@/components/management/ManagementLayout";
import StoreManagerLayout from "@/components/store-manager/StoreManagerLayout";
import EmployeeLayout from "@/components/employee/EmployeeLayout";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium mt-3">
          Đang khởi tạo hệ thống...
        </p>
      </div>
    );
  }

  if (isAuthenticated && user) {
    switch (user.roleCode || user.role) {
      case "ADMIN":
        return <AdminLayout />;
      case "MANAGER":
        return <ManagementLayout />;
      case "STORE_MANAGER":
        return <StoreManagerLayout />;
      case "EMPLOYEE":
        return <EmployeeLayout />;
      default:
        return null;
    }
  }

  return (
    <>
      <AuthLayout>
        {authMode === "login" ? (
          <LoginForm
            onSwitchToRegister={() => setAuthMode("register")}
            onOpenForgotPassword={() => setIsForgotModalOpen(true)}
          />
        ) : (
          <RegisterForm onSwitchToLogin={() => setAuthMode("login")} />
        )}
      </AuthLayout>
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
      />
    </>
  );
}
