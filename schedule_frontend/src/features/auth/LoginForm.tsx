"use client";

import React, { useState } from "react";
import { Eye, EyeOff, ArrowRight, AlertCircle, Info, Loader2, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { ApiError } from "@/lib/api";

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onOpenForgotPassword: () => void;
}

export default function LoginForm({
  onSwitchToRegister,
  onOpenForgotPassword,
}: LoginFormProps) {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isFocusedIdentifier, setIsFocusedIdentifier] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Form is complete when both fields have content
  const isFormComplete = identifier.trim().length > 0 && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormComplete || isLoading) return;

    // Reset error states
    setGeneralError(null);
    setPasswordError(null);
    setIsLoading(true);

    try {
      const res = await login({
        identifier: identifier.trim(),
        password,
      });

      // Show toast with exact backend message
      showToast(
        res.message || "Đăng nhập thành công",
        "success",
        res.statusCode || 200
      );
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        // Display toast with exact backend error message and HTTP code
        showToast(err.serverMessage, "error", err.statusCode);

        if (err.statusCode === 401) {
          setGeneralError(
            err.serverMessage === "Sai tài khoản hoặc mật khẩu"
              ? "Thông tin đăng nhập chưa chính xác. Kiểm tra tên đăng nhập và mật khẩu, hoặc chọn Quên mật khẩu."
              : err.serverMessage
          );
          setPasswordError("Mật khẩu không đúng. Vui lòng thử lại.");
        } else if (err.statusCode === 403) {
          setGeneralError(err.serverMessage || "Tài khoản chưa được kích hoạt hoặc đã bị khóa.");
        } else {
          setGeneralError(err.serverMessage);
        }
      } else {
        const errorText = "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.";
        showToast(errorText, "error", 500);
        setGeneralError(errorText);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Form Card Header */}
      <div className="mb-6">
        <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          CỔNG QUẢN LÝ NHÂN SỰ
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
          Đăng nhập
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-1.5 leading-relaxed">
          Chào mừng bạn trở lại. Đăng nhập để bắt đầu ngày làm việc.
        </p>
      </div>

      {/* Top Banner Alert / Guide */}
      <div className="mb-5 transition-all">
        {generalError ? (
          /* Error State Banner */
          <div className="bg-[#FEF2F2] border border-[#FEE2E2] rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-[#DC2626] animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#DC2626]" />
            <div className="leading-snug">{generalError}</div>
          </div>
        ) : isLoading ? (
          /* Loading State Banner */
          <div className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-[#92400E] animate-in fade-in duration-200">
            <Clock className="w-4 h-4 shrink-0 mt-0.5 text-[#F59E0B]" />
            <div className="leading-snug">
              Đang xác thực tài khoản. Vui lòng chờ, không gửi lại yêu cầu.
            </div>
          </div>
        ) : !isFormComplete ? (
          /* Initial / Incomplete Prompt Banner */
          <div className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-xl p-3 flex items-start gap-2.5 text-xs text-[#92400E]">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#F59E0B]" />
            <div className="leading-snug">
              Nhập email hoặc tên đăng nhập và mật khẩu để bật nút Đăng nhập.
            </div>
          </div>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email or Username Input */}
        <div>
          <label
            htmlFor="identifier"
            className="block text-[13px] font-semibold text-slate-700 mb-1.5"
          >
            Email hoặc tên đăng nhập
          </label>
          <div className="relative">
            <input
              id="identifier"
              type="text"
              autoComplete="username"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                if (generalError) setGeneralError(null);
              }}
              onFocus={() => setIsFocusedIdentifier(true)}
              onBlur={() => setIsFocusedIdentifier(false)}
              placeholder="Nhập email hoặc tên đăng nhập"
              disabled={isLoading}
              className={`w-full rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all ${
                isLoading ? "bg-slate-50 cursor-not-allowed" : "bg-white"
              } ${
                isFocusedIdentifier || identifier
                  ? "border border-[#F59E0B] ring-2 ring-[#F59E0B]/20"
                  : "border border-slate-200 hover:border-slate-300"
              }`}
            />
          </div>
          {/* Helper hint when typing or focused */}
          {(isFocusedIdentifier || identifier) && (
            <p className="text-[11px] text-slate-400 mt-1 pl-1">
              Dùng tài khoản do quản trị viên cấp hoặc đã đăng ký.
            </p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <label
            htmlFor="password"
            className="block text-[13px] font-semibold text-slate-700 mb-1.5"
          >
            Mật khẩu
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError(null);
                if (generalError) setGeneralError(null);
              }}
              placeholder="Nhập mật khẩu"
              disabled={isLoading}
              className={`w-full rounded-xl pl-4 pr-11 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all ${
                isLoading ? "bg-slate-50 cursor-not-allowed" : "bg-white"
              } ${
                passwordError
                  ? "border-2 border-[#EF4444] ring-2 ring-red-100"
                  : "border border-slate-200 focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20"
              }`}
            />
            {/* Toggle show/hide password */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Field Error Message */}
          {passwordError && (
            <p className="text-xs text-[#DC2626] font-medium mt-1.5 pl-1">
              {passwordError}
            </p>
          )}
        </div>

        {/* Remember Me & Forgot Password Row */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                rememberMe
                  ? "bg-[#F59E0B] border border-[#F59E0B]"
                  : "bg-white border border-slate-300"
              }`}
            >
              {rememberMe && (
                <svg
                  className="w-3 h-3 text-white fill-current stroke-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                </svg>
              )}
            </div>
            <span className="text-xs text-slate-600">Ghi nhớ đăng nhập</span>
          </label>

          <button
            type="button"
            onClick={onOpenForgotPassword}
            className="text-xs font-semibold text-[#B91C1C] hover:text-[#991B1B] hover:underline cursor-pointer"
          >
            Quên mật khẩu?
          </button>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          {isFormComplete ? (
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 shadow-sm ${
                isLoading
                  ? "bg-[#F59E0B] opacity-90 cursor-wait"
                  : "bg-[#F59E0B] hover:bg-[#D97706] active:scale-[0.99] cursor-pointer shadow-amber-500/20"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  <span>Đăng nhập</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="w-full py-3.5 rounded-xl text-sm font-semibold bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed transition-all flex items-center justify-center"
            >
              Đăng nhập
            </button>
          )}
        </div>

        {/* Secondary Action: Go to Register */}
        <div className="text-center pt-3">
          <p className="text-xs text-slate-600">
            Chưa có tài khoản?{" "}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="font-bold text-[#DC2626] hover:text-[#B91C1C] hover:underline cursor-pointer ml-1"
            >
              Đăng ký
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
