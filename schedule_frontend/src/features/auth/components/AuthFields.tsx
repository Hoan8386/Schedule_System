import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/cn";

const baseInput = "w-full rounded-xl py-2.5 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 border";
const stateClass = (invalid: boolean) =>
  invalid ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100" : "border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

interface FieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  id: string;
  label: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  /** true khi đã nhập nhưng chưa hợp lệ */
  invalid?: boolean;
  hint?: string;
}

function Label({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <label htmlFor={id} className="mb-1 block text-[13px] font-semibold text-slate-700">
      {children}
    </label>
  );
}

/** Ô nhập của form xác thực, tô đỏ khi không hợp lệ. */
export function AuthTextField({ id, label, value, onChange, invalid = false, hint, className, ...props }: FieldProps) {
  return (
    <div>
      <Label id={id}>{label}</Label>
      <input id={id} value={value} onChange={(event) => onChange(event.target.value)} className={cn(baseInput, "px-4", stateClass(invalid), className)} {...props} />
      {invalid && hint && <p className="mt-1 text-[11px] text-red-500">{hint}</p>}
    </div>
  );
}

/** Ô mật khẩu có nút hiện / ẩn. */
export function AuthPasswordField({ id, label, value, onChange, invalid = false, hint, children, ...props }: FieldProps & { children?: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <Label id={id}>{label}</Label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(baseInput, "pl-4 pr-11", stateClass(invalid))}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-slate-400 hover:text-slate-600"
        >
          {visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
      </div>
      {children}
      {invalid && hint && <p className="mt-1 text-[11px] text-red-500">{hint}</p>}
    </div>
  );
}

/** Điểm mạnh mật khẩu 0..4 (độ dài, chữ hoa, số, ký tự đặc biệt). */
export function passwordStrength(password: string) {
  if (!password) return 0;
  return [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
}

export function PasswordStrengthBar({ password }: { password: string }) {
  if (!password) return null;
  const strength = passwordStrength(password);
  const bar = strength >= 3 ? "w-full bg-emerald-500" : strength >= 1 ? "w-2/3 bg-brand-500" : "w-1/3 bg-red-500";
  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex h-1 w-full gap-1 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full transition-all ${bar}`} />
      </div>
      <span className="block text-right text-[10px] text-slate-400">{strength < 2 ? "Mật khẩu yếu" : strength < 4 ? "Mật khẩu khá" : "Mật khẩu mạnh"}</span>
    </div>
  );
}
