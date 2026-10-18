import React from "react";
import { cn } from "@/lib/cn";
import { useSchedule } from "../ScheduleContext";
import { FilterSelect } from "./FilterSelect";

interface StoreFilterProps {
  className?: string;
  /** false: không có lựa chọn "Tất cả cửa hàng" (luôn chọn một cửa hàng) */
  allowAll?: boolean;
  /** Giá trị hiển thị khi không cho chọn tất cả (vd. cửa hàng đầu tiên làm mặc định) */
  value?: string;
}

/** Ô lọc cửa hàng đặt trong từng tab; dữ liệu các tab được lọc theo lựa chọn này (giữ nguyên khi chuyển tab). */
export function StoreFilter({ className = "min-w-52", allowAll = true, value }: StoreFilterProps) {
  const { storeFilter, setStoreFilter, lookups } = useSchedule();
  if (allowAll) {
    return (
      <FilterSelect
        label="Cửa hàng"
        allLabel="Tất cả cửa hàng"
        className={className}
        value={storeFilter}
        onChange={setStoreFilter}
        options={lookups.options.stores}
      />
    );
  }
  return (
    <label className={cn("text-[11px] font-semibold text-slate-600", className)}>
      Cửa hàng
      <select value={value ?? storeFilter} onChange={(event) => setStoreFilter(event.target.value)} className="field-input font-medium">
        {lookups.options.stores.map((option) => (
          <option key={option.value} value={String(option.value)}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}
