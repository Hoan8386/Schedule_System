import React from "react";
import { AlertCircle, CheckCircle2, KeyRound, Loader2 } from "lucide-react";

interface Props {
  username: string;
  email: string;
  error: string | null;
  canActivate: boolean;
  activating: boolean;
  activated: boolean;
  onActivate: () => void;
  onBackToLogin: () => void;
}

/** Màn hình sau khi đăng ký thành công: kích hoạt ngay hoặc quay lại đăng nhập. */
export function RegisterSuccess({ username, email, error, canActivate, activating, activated, onActivate, onBackToLogin }: Props) {
  return (
    <div className="w-full py-2 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-600">
        <CheckCircle2 className="h-8 w-8 stroke-[2]" />
      </div>
      <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">Đăng ký thành công!</h3>
      <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-slate-500 sm:text-sm">
        Tài khoản <span className="font-semibold text-slate-800">{username}</span> ({email}) đã được tạo trên hệ thống Ăn Vặt BLOAN.
      </p>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-left text-xs text-red-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {activated ? (
        <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          🎉 Kích hoạt tài khoản thành công! Đang chuyển đến màn hình Đăng nhập...
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {canActivate && (
            <button
              type="button"
              onClick={onActivate}
              disabled={activating}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-500 py-3.5 text-sm font-bold text-white shadow-md shadow-brand-500/20 transition-all hover:bg-brand-600"
            >
              {activating ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
              <span>{activating ? "Đang kích hoạt tài khoản..." : "Kích hoạt tài khoản ngay"}</span>
            </button>
          )}
          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full cursor-pointer rounded-xl bg-slate-100 py-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200 sm:text-sm"
          >
            Quay lại Đăng nhập
          </button>
        </div>
      )}
    </div>
  );
}
