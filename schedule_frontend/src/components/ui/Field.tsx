import React from "react";
import { cn } from "@/lib/cn";

interface FieldProps {
  label: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/** Nhãn + control. */
export function Field({ label, className, children }: FieldProps) {
  return (
    <label className={cn("field-label", className)}>
      {label}
      {children}
    </label>
  );
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn("field-input", className)} {...props} />;
  }
);

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, rows = 2, ...props }, ref) {
    return <textarea ref={ref} rows={rows} className={cn("field-input", className)} {...props} />;
  }
);

export interface SelectOption {
  value: string | number;
  label: React.ReactNode;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  /** Nhãn của lựa chọn rỗng; bỏ trống để không hiển thị. */
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ className, options, placeholder, ...props }, ref) {
    return (
      <select ref={ref} className={cn("field-input", className)} {...props}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    );
  }
);

/** Tiêu đề nhóm trong form lưới 2 cột. */
export function FormSection({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="border-b border-slate-100 pb-1 pt-2 sm:col-span-2">
      <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">{title}</p>
      {hint && <p className="text-[10px] text-slate-400">{hint}</p>}
    </div>
  );
}
