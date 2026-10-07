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
import { Sparkles, Users, Store, Shield, UserCheck } from "lucide-react";
import { UserRoleCode } from "@/types/auth";

export default function Home() {
  const { user, isAuthenticated, isLoading, mockLoginForDemo } = useAuth();
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [showDemoBar, setShowDemoBar] = useState(true);

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
    const roleCode = (user.roleCode || user.role || "ADMIN") as string;
    if (roleCode === "ADMIN") {
      return <AdminLayout />;
    }
    if (roleCode === "STORE_MANAGER") {
      return <StoreManagerLayout />;
    }
    if (roleCode === "EMPLOYEE") {
      return <EmployeeLayout />;
    }
    // Default to Manager Layout for MANAGER or other roles
    return <ManagementLayout />;
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

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
      />

      {/* Quick Demo Assist Pill: 4 roles selector */}
      {showDemoBar && (
        <aside
          aria-label="Công cụ kiểm tra nhanh 4 phân quyền"
          className="fixed bottom-4 right-4 z-40 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xl p-3.5 text-xs max-w-sm sm:max-w-md hidden sm:block animate-in slide-in-from-bottom-2 duration-300"
        >
          <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Đăng nhập nhanh theo 4 Phân quyền</span>
            </div>
            <button
              type="button"
              onClick={() => setShowDemoBar(false)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer font-bold px-1"
              title="Đóng thanh tiện ích"
            >
              ✕
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
            Chọn một vai trò bên dưới để kiểm thử giao diện & luồng nghiệp vụ tương ứng:
          </p>
          <div className="mt-2.5 grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => mockLoginForDemo(undefined, "ADMIN")}
              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold border border-amber-200 text-[11px] transition-colors flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>1. ADMIN (Quản trị viên)</span>
            </button>
            <button
              type="button"
              onClick={() => mockLoginForDemo(undefined, "MANAGER")}
              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold border border-amber-200 text-[11px] transition-colors flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>2. MANAGER (Quản lý)</span>
            </button>
            <button
              type="button"
              onClick={() => mockLoginForDemo(undefined, "STORE_MANAGER")}
              className="px-2.5 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-900 font-bold border border-orange-200 text-[11px] transition-colors flex items-center gap-1.5"
            >
              <Store className="w-3.5 h-3.5 text-orange-600 shrink-0" />
              <span>3. Trưởng cửa hàng</span>
            </button>
            <button
              type="button"
              onClick={() => mockLoginForDemo(undefined, "EMPLOYEE")}
              className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold border border-blue-200 text-[11px] transition-colors flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>4. Nhân viên</span>
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
