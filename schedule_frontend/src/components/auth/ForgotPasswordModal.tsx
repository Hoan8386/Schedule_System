"use client";

import React, { useState } from "react";
import { X, Mail, KeyRound, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { authApi, ApiError } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({
  isOpen,
  onClose,
}: ForgotPasswordModalProps) {
  const { showToast } = useToast();

  const [step, setStep] = useState<"request" | "reset" | "success">("request");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isLoading) return;

    setError(null);
    setIsLoading(true);

    try {
      const res = await authApi.forgotPassword({ email: email.trim() });
      showToast(
        res.message || "Đã tạo yêu cầu đặt lại mật khẩu",
        "success",
        res.statusCode || 200
      );

      if (res.data && res.data.token) {
        setToken(res.data.token);
      }
      setStep("reset");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        showToast(err.serverMessage, "error", err.statusCode);
        setError(err.serverMessage);
      } else {
        const errText = "Không thể gửi yêu cầu đặt lại mật khẩu.";
        showToast(errText, "error", 500);
        setError(errText);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim() || !password || password !== confirmPassword || isLoading) return;

    setError(null);
    setIsLoading(true);

    try {
      const res = await authApi.resetPassword({
        email: email.trim(),
        token: token.trim(),
        password,
        confirmPassword,
      });

      showToast(
        res.message || "Đặt lại mật khẩu thành công",
        "success",
        res.statusCode || 200
      );

      setStep("success");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        showToast(err.serverMessage, "error", err.statusCode);
        setError(err.serverMessage);
      } else {
        const errText = "Không thể đặt lại mật khẩu. Vui lòng kiểm tra lại mã token.";
        showToast(errText, "error", 500);
        setError(errText);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {step === "request" && (
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#F59E0B] border border-amber-100 flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Quên mật khẩu?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-5 leading-relaxed">
              Nhập email tài khoản nhân sự của bạn để nhận mã xác thực đặt lại mật khẩu.
            </p>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-600 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRequestToken} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email đã đăng ký
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nhanvien@bloan.vn"
                  required
                  className="w-full rounded-xl px-4 py-2.5 text-sm border border-slate-200 focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full py-3 rounded-xl text-sm font-bold bg-[#F59E0B] hover:bg-[#D97706] text-white transition-all flex items-center justify-center gap-2 disabled:bg-slate-200 disabled:text-slate-400 cursor-pointer disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang kiểm tra...</span>
                  </>
                ) : (
                  <>
                    <span>Gửi yêu cầu đặt lại</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {step === "reset" && (
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#F59E0B] border border-amber-100 flex items-center justify-center mb-4">
              <KeyRound className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Đặt lại mật khẩu mới
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-5 leading-relaxed">
              Mã xác thực đã được tạo cho email <span className="font-semibold text-slate-800">{email}</span>. Vui lòng nhập thông tin mới.
            </p>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-600 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mã Token xác nhận
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Dán mã token được cấp"
                  required
                  className="w-full rounded-xl px-4 py-2.5 text-xs font-mono border border-slate-200 focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mật khẩu mới (tối thiểu 8 ký tự)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl px-4 py-2.5 text-sm border border-slate-200 focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl px-4 py-2.5 text-sm border border-slate-200 focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !token.trim() || password.length < 8 || password !== confirmPassword}
                className="w-full py-3 rounded-xl text-sm font-bold bg-[#F59E0B] hover:bg-[#D97706] text-white transition-all flex items-center justify-center gap-2 disabled:bg-slate-200 disabled:text-slate-400 cursor-pointer disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang cập nhật...</span>
                  </>
                ) : (
                  <span>Xác nhận mật khẩu mới</span>
                )}
              </button>
            </form>
          </div>
        )}

        {step === "success" && (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 stroke-[2]" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Đặt lại mật khẩu thành công!
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 mb-6 leading-relaxed">
              Mật khẩu mới của bạn đã được cập nhật. Bạn có thể dùng mật khẩu này để đăng nhập ngay bây giờ.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-xl text-sm font-bold bg-[#F59E0B] hover:bg-[#D97706] text-white transition-all cursor-pointer"
            >
              Về màn hình Đăng nhập
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
