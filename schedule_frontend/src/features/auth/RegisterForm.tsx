"use client";

import React, { useState } from "react";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { ApiError } from "@/lib/api";
import { AuthPasswordField, AuthTextField, PasswordStrengthBar } from "./components/AuthFields";
import { RegisterSuccess } from "./components/RegisterSuccess";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Đăng ký tài khoản nhân sự và kích hoạt ngay bằng token trả về. */
export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const { register, confirmAccount } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState({ username: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);

  const set = (key: keyof typeof form) => (next: string) => setForm((prev) => ({ ...prev, [key]: next }));
  const valid = {
    username: form.username.trim().length >= 3,
    email: EMAIL_PATTERN.test(form.email.trim()),
    password: form.password.length >= 8,
    confirm: form.password === form.confirmPassword && form.confirmPassword.length > 0,
  };
  const isFormValid = Object.values(valid).every(Boolean);

  /** Hiện lỗi từ backend (hoặc thông báo mặc định) ở toast và banner. */
  const reportError = (cause: unknown, fallback: string) => {
    if (cause instanceof ApiError) {
      showToast(cause.serverMessage, "error", cause.statusCode);
      setGeneralError(cause.serverMessage);
    } else {
      showToast(fallback, "error", 500);
      setGeneralError(fallback);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isFormValid || isLoading) return;
    setGeneralError(null);
    setIsLoading(true);
    try {
      const res = await register({
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || undefined,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      showToast(res.message || "Đăng ký thành công, vui lòng xác nhận tài khoản", "success", res.statusCode || 201);
      setRegistered(true);
      if (res.data?.token) setToken(res.data.token);
    } catch (cause) {
      reportError(cause, "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const activate = async () => {
    if (!token || activating) return;
    setActivating(true);
    setGeneralError(null);
    try {
      const res = await confirmAccount(token);
      showToast(res.message || "Xác nhận tài khoản thành công", "success", res.statusCode || 200);
      setActivated(true);
      setTimeout(onSwitchToLogin, 1500);
    } catch (cause) {
      reportError(cause, "Lỗi kết nối khi kích hoạt tài khoản.");
    } finally {
      setActivating(false);
    }
  };

  if (registered) {
    return (
      <RegisterSuccess
        username={form.username}
        email={form.email}
        error={generalError}
        canActivate={Boolean(token)}
        activating={activating}
        activated={activated}
        onActivate={() => void activate()}
        onBackToLogin={onSwitchToLogin}
      />
    );
  }

  const required = <span className="text-red-500">*</span>;

  return (
    <div className="w-full">
      <div className="mb-5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">CỔNG QUẢN LÝ NHÂN SỰ</span>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Đăng ký tài khoản</h2>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-500 sm:text-sm">Tạo tài khoản nhân sự mới cho chuỗi Ăn Vặt BLOAN.</p>
      </div>

      {generalError && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-3.5 text-xs text-red-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <div className="leading-snug">{generalError}</div>
        </div>
      )}

      <form onSubmit={submit} className="space-y-3.5">
        <AuthTextField
          id="reg-username"
          label={<>Tên đăng nhập {required}</>}
          value={form.username}
          onChange={set("username")}
          placeholder="Ví dụ: minhanh_bloan"
          disabled={isLoading}
          invalid={Boolean(form.username) && !valid.username}
          hint="Tên đăng nhập cần tối thiểu 3 ký tự"
        />
        <AuthTextField
          id="reg-email"
          type="email"
          label={<>Email nhân viên {required}</>}
          value={form.email}
          onChange={set("email")}
          placeholder="minhanh@bloan.vn"
          disabled={isLoading}
          invalid={Boolean(form.email) && !valid.email}
        />
        <AuthTextField
          id="reg-phone"
          type="tel"
          label={<>Số điện thoại liên hệ <span className="font-normal text-slate-400">(tùy chọn)</span></>}
          value={form.phone}
          onChange={set("phone")}
          placeholder="0912345678"
          disabled={isLoading}
        />
        <AuthPasswordField
          id="reg-password"
          label={<>Mật khẩu {required}</>}
          value={form.password}
          onChange={set("password")}
          placeholder="Tối thiểu 8 ký tự"
          disabled={isLoading}
          invalid={Boolean(form.password) && !valid.password}
        >
          <PasswordStrengthBar password={form.password} />
        </AuthPasswordField>
        <AuthPasswordField
          id="reg-confirm"
          label={<>Xác nhận mật khẩu {required}</>}
          value={form.confirmPassword}
          onChange={set("confirmPassword")}
          placeholder="Nhập lại mật khẩu"
          disabled={isLoading}
          invalid={Boolean(form.confirmPassword) && !valid.confirm}
          hint="Mật khẩu xác nhận chưa khớp"
        />

        <div className="pt-2">
          {isFormValid ? (
            <button
              type="submit"
              disabled={isLoading}
              className={`flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3.5 text-sm font-bold text-white shadow-sm transition-all ${
                isLoading ? "cursor-wait opacity-90" : "cursor-pointer shadow-brand-500/20 hover:bg-brand-600 active:scale-[0.99]"
              }`}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              <span>{isLoading ? "Đang xử lý đăng ký..." : "Đăng ký tài khoản"}</span>
              {!isLoading && <ArrowRight className="h-4 w-4 stroke-[2.5]" />}
            </button>
          ) : (
            <button type="button" disabled className="flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-gray-100 py-3.5 text-sm font-semibold text-gray-400 transition-all">
              Đăng ký tài khoản
            </button>
          )}
        </div>

        <div className="pt-2 text-center">
          <p className="text-xs text-slate-600">
            Đã có tài khoản?{" "}
            <button type="button" onClick={onSwitchToLogin} className="ml-1 cursor-pointer font-bold text-red-600 hover:text-red-700 hover:underline">
              Đăng nhập
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
