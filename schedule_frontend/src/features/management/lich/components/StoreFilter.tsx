import React from "react";
import { useSchedule } from "../ScheduleContext";
import { FilterSelect } from "./FilterSelect";

interface StoreFilterProps {
  className?: string;
  /** false: không có lựa chọn "Tất cả cửa hàng" (luôn chọn một cửa hàng) */
  allowAll?: boolean;
  /** Giá trị hiển thị khi không cho chọn tất cả (vd. cửa hàng đầu tiên làm mặc định) */
  value?: string;
  /** Thay cho việc đổi ngay cửa hàng đang lọc (vd. chỉ áp dụng khi bấm "Tìm kiếm") */
  onChange?: (storeId: string) => void;
}

/** Ô lọc cửa hàng đặt trong từng tab; dữ liệu các tab được lọc theo lựa chọn này (giữ nguyên khi chuyển tab). */
export function StoreFilter({ className = "min-w-52", allowAll = true, value, onChange }: StoreFilterProps) {
  const { storeFilter, setStoreFilter: changeStore, lookups } = useSchedule();
  const setStoreFilter = onChange ?? changeStore;
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
    <FilterSelect
      label="Cửa hàng"
      className={className}
      value={value ?? storeFilter}
      onChange={setStoreFilter}
      options={lookups.options.stores}
    />
  );
}
