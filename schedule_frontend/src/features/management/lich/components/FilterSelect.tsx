import React from "react";
import { cn } from "@/lib/cn";

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  allLabel: string;
  options: { value: string | number; label: React.ReactNode }[];
  className?: string;
}

/** Ô chọn dùng cho thanh lọc (giá trị rỗng = tất cả). */
export function FilterSelect({ label, value, onChange, allLabel, options, className = "min-w-48" }: FilterSelectProps) {
  return (
    <label className={cn("text-[11px] font-semibold text-slate-600", className)}>
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="field-input font-medium">
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={String(option.value)}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}
