"use client";

import React, { useState } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import ForgotPasswordModal from "@/components/auth/ForgotPasswordModal";
import DashboardView from "@/components/dashboard/DashboardView";
import { useAuth } from "@/context/AuthContext";
import { Sparkles } from "lucide-react";

export default function Home() {
  const { isAuthenticated, isLoading, mockLoginForDemo } = useAuth();
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

  if (isAuthenticated) {
    return <DashboardView />;
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

      {/* Quick Demo Assist Pill (can be collapsed or dismissed) */}
      {showDemoBar && (
        <aside
          aria-label="Công cụ kiểm tra nhanh"
          className="fixed bottom-4 right-4 z-40 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xl p-3 text-xs max-w-xs sm:max-w-md hidden sm:block animate-in slide-in-from-bottom-2 duration-300"
        >
          <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Tiện ích kiểm thử giao diện & API</span>
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
            Hệ thống đang kết nối trực tiếp với backend Spring Boot tại <code className="bg-slate-100 px-1 py-0.5 rounded text-amber-700 font-mono">http://localhost:8080</code>.
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => {
                setAuthMode("login");
                mockLoginForDemo("minhanh");
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold border border-amber-200 text-[11px] transition-colors cursor-pointer"
            >
              ⚡ Xem trước Dashboard
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === "login" ? "register" : "login");
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition-colors cursor-pointer"
            >
              🔄 Chuyển sang {authMode === "login" ? "Đăng ký" : "Đăng nhập"}
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
