"use client";

import React, { useState } from "react";
import AuthLayout from "@/features/auth/AuthLayout";
import LoginForm from "@/features/auth/LoginForm";
import RegisterForm from "@/features/auth/RegisterForm";
import ForgotPasswordModal from "@/features/auth/ForgotPasswordModal";
import AdminLayout from "@/features/admin/AdminLayout";
import ManagementLayout from "@/features/management/ManagementLayout";
import StoreManagerLayout from "@/features/store-manager/StoreManagerLayout";
import EmployeeLayout from "@/features/employee/EmployeeLayout";
import { useAuth } from "@/context/AuthContext";
import { FullPageLoader } from "@/components/ui";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  if (isLoading) return <FullPageLoader label="Đang khởi tạo hệ thống..." />;

  if (isAuthenticated && user) {
    switch (Number(user.roleId)) {
      case 1:
        return <AdminLayout />;
      case 2:
        return <ManagementLayout />;
      case 3:
        return <StoreManagerLayout />;
      case 4:
        return <EmployeeLayout />;
      default:
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
