"use client";

import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  KeyRound,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { ApiError } from "@/lib/api";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const { register, confirmAccount } = useAuth();
  const { showToast } = useToast();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Success state after registration
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [confirmationToken, setConfirmationToken] = useState<string | null>(null);
  const [isActivating, setIsActivating] = useState(false);
  const [activationSuccess, setActivationSuccess] = useState(false);

  // Validation
  const isUsernameValid = username.trim().length >= 3;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordValid = password.length >= 8;
  const isConfirmValid = password === confirmPassword && confirmPassword.length > 0;

  const isFormValid =
    isUsernameValid && isEmailValid && isPasswordValid && isConfirmValid;

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isLoading) return;

    setGeneralError(null);
    setIsLoading(true);

    try {
      const res = await register({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        password,
        confirmPassword,
      });

      // Show toast with exact message from backend
      showToast(
        res.message || "Đăng ký thành công, vui lòng xác nhận tài khoản",
        "success",
        res.statusCode || 201
      );

      setRegistrationSuccess(true);
      if (res.data && res.data.token) {
        setConfirmationToken(res.data.token);
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        showToast(err.serverMessage, "error", err.statusCode);
        setGeneralError(err.serverMessage);
      } else {
        const errorText = "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.";
        showToast(errorText, "error", 500);
        setGeneralError(errorText);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivateNow = async () => {
    if (!confirmationToken || isActivating) return;
    setIsActivating(true);
    setGeneralError(null);

    try {
      const res = await confirmAccount(confirmationToken);

      showToast(
        res.message || "Xác nhận tài khoản thành công",
        "success",
        res.statusCode || 200
      );

      setActivationSuccess(true);
      setTimeout(() => {
        onSwitchToLogin();
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        showToast(err.serverMessage, "error", err.statusCode);
        setGeneralError(err.serverMessage);
      } else {
        const errText = "Lỗi kết nối khi kích hoạt tài khoản.";
        showToast(errText, "error", 500);
        setGeneralError(errText);
      }
    } finally {
      setIsActivating(false);
    }
  };

  // SUCCESS / CONFIRMATION VIEW
  if (registrationSuccess) {
    return (
      <div className="w-full text-center py-2 animate-in fade-in duration-300">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 stroke-[2]" />
        </div>

        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Đăng ký thành công!
        </h3>
        <p className="text-slate-500 text-xs sm:text-sm mt-2 max-w-sm mx-auto leading-relaxed">
          Tài khoản <span className="font-semibold text-slate-800">{username}</span> ({email}) đã được tạo trên hệ thống Ăn Vặt BLOAN.
        </p>

        {generalError && (
          <div className="mt-4 bg-[#FEF2F2] border border-[#FEE2E2] rounded-xl p-3 text-xs text-[#DC2626] text-left flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{generalError}</span>
          </div>
        )}

        {activationSuccess ? (
          <div className="mt-6 bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-emerald-800 text-sm font-semibold">
            🎉 Kích hoạt tài khoản thành công! Đang chuyển đến màn hình Đăng nhập...
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {confirmationToken && (
              <button
                type="button"
                onClick={handleActivateNow}
                disabled={isActivating}
                className="w-full py-3.5 rounded-xl text-sm font-bold bg-[#F59E0B] hover:bg-[#D97706] text-white shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isActivating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang kích hoạt tài khoản...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Kích hoạt tài khoản ngay</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onSwitchToLogin}
              className="w-full py-3 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              Quay lại Đăng nhập
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Form Header */}
      <div className="mb-5">
        <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          CỔNG QUẢN LÝ NHÂN SỰ
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
          Đăng ký tài khoản
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-1.5 leading-relaxed">
          Tạo tài khoản nhân sự mới cho chuỗi Ăn Vặt BLOAN.
        </p>
      </div>

      {/* Error Banner */}
      {generalError && (
        <div className="mb-4 bg-[#FEF2F2] border border-[#FEE2E2] rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-[#DC2626] animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#DC2626]" />
          <div className="leading-snug">{generalError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Username */}
        <div>
          <label
            htmlFor="reg-username"
            className="block text-[13px] font-semibold text-slate-700 mb-1"
          >
            Tên đăng nhập <span className="text-red-500">*</span>
          </label>
          <input
            id="reg-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ví dụ: minhanh_bloan"
            disabled={isLoading}
            className={`w-full rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all border ${
              username && !isUsernameValid
                ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                : "border-slate-200 focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20"
            }`}
          />
          {username && !isUsernameValid && (
            <p className="text-[11px] text-red-500 mt-1">
              Tên đăng nhập cần tối thiểu 3 ký tự
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="reg-email"
            className="block text-[13px] font-semibold text-slate-700 mb-1"
          >
            Email nhân viên <span className="text-red-500">*</span>
          </label>
          <input
            id="reg-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="minhanh@bloan.vn"
            disabled={isLoading}
            className={`w-full rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all border ${
              email && !isEmailValid
                ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                : "border-slate-200 focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20"
            }`}
          />
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="reg-phone"
            className="block text-[13px] font-semibold text-slate-700 mb-1"
          >
            Số điện thoại liên hệ <span className="text-slate-400 font-normal">(tùy chọn)</span>
          </label>
          <input
            id="reg-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0912345678"
            disabled={isLoading}
            className="w-full rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none border border-slate-200 focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all"
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="reg-password"
            className="block text-[13px] font-semibold text-slate-700 mb-1"
          >
            Mật khẩu <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 8 ký tự"
              disabled={isLoading}
              className={`w-full rounded-xl pl-4 pr-11 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all border ${
                password && !isPasswordValid
                  ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  : "border-slate-200 focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>

          {/* Strength bar */}
          {password && (
            <div className="mt-1.5 space-y-1">
              <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                <div
                  className={`h-full transition-all rounded-full ${
                    strength >= 1
                      ? strength >= 3
                        ? "bg-emerald-500 w-full"
                        : "bg-amber-500 w-2/3"
                      : "bg-red-500 w-1/3"
                  }`}
                />
              </div>
              <span className="text-[10px] text-slate-400 block text-right">
                {strength < 2 ? "Mật khẩu yếu" : strength < 4 ? "Mật khẩu khá" : "Mật khẩu mạnh"}
              </span>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="reg-confirm"
            className="block text-[13px] font-semibold text-slate-700 mb-1"
          >
            Xác nhận mật khẩu <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="reg-confirm"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu"
              disabled={isLoading}
              className={`w-full rounded-xl pl-4 pr-11 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all border ${
                confirmPassword && !isConfirmValid
                  ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  : "border-slate-200 focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              {showConfirmPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
          {confirmPassword && !isConfirmValid && (
            <p className="text-[11px] text-red-500 mt-1">
              Mật khẩu xác nhận chưa khớp
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          {isFormValid ? (
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
                  <span>Đang xử lý đăng ký...</span>
                </>
              ) : (
                <>
                  <span>Đăng ký tài khoản</span>
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
              Đăng ký tài khoản
            </button>
          )}
        </div>

        {/* Switch back to Login */}
        <div className="text-center pt-2">
          <p className="text-xs text-slate-600">
            Đã có tài khoản?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-bold text-[#DC2626] hover:text-[#B91C1C] hover:underline cursor-pointer ml-1"
            >
              Đăng nhập
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
