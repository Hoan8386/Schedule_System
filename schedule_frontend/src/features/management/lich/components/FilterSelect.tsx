import React from "react";
import { SearchSelect } from "@/components/ui";
import { cn } from "@/lib/cn";

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Nhãn của lựa chọn "tất cả" (giá trị rỗng); bỏ trống = bắt buộc chọn một giá trị */
  allLabel?: string;
  options: { value: string | number; label: string }[];
  className?: string;
}

/** Ô lọc cho thanh lọc: gõ chữ để tìm trong danh sách (giá trị rỗng = tất cả). */
export function FilterSelect({ label, value, onChange, allLabel, options, className = "min-w-48" }: FilterSelectProps) {
  return (
    <div className={cn("text-[11px] font-semibold text-slate-600", className)}>
      <span className="mb-1 block">{label}</span>
      <SearchSelect
        aria-label={label}
        value={value}
        onChange={onChange}
        allLabel={allLabel}
        placeholder={allLabel ? `${allLabel} – gõ để tìm` : "Gõ để tìm..."}
        options={options.map((option) => ({ value: String(option.value), label: option.label }))}
        inputClassName="font-medium"
      />
    </div>
  );
}
