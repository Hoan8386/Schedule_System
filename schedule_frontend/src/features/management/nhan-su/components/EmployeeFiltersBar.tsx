import React from "react";
import { Search, X } from "lucide-react";
import type { StoreResponse } from "@/lib/api";
import { value } from "../utils";
import { EMPTY_FILTERS, type EmployeeFilters, type RoleFilter } from "../useEmployees";

interface Props {
  filters: EmployeeFilters;
  onChange: (filters: EmployeeFilters) => void;
  stores: StoreResponse[];
}

const selectClass = "rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs";

export function EmployeeFiltersBar({ filters, onChange, stores }: Props) {
  const set = <K extends keyof EmployeeFilters>(key: K, next: EmployeeFilters[K]) => onChange({ ...filters, [key]: next });

  return (
    <div className="overflow-x-auto border-b border-slate-100 bg-slate-50/50 p-4">
      <div className="flex min-w-max flex-nowrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={filters.search}
            onChange={(event) => set("search", event.target.value)}
            placeholder="Tìm tên, mã, email, số điện thoại..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs"
          />
        </div>

        <select value={filters.status} onChange={(event) => set("status", event.target.value)} className={selectClass}>
          <option value="ALL">Trạng thái: Tất cả</option>
          <option value="ACTIVE">Đang làm việc</option>
          <option value="INACTIVE">Tạm ngưng</option>
          <option value="RESIGNED">Đã nghỉ việc</option>
        </select>

        <select value={filters.storeId} onChange={(event) => set("storeId", event.target.value)} className={selectClass}>
          <option value="ALL">Cửa hàng: Tất cả</option>
          {stores.map((store) => (
            <option key={store.id} value={store.id}>{value(store.storeName)}</option>
          ))}
        </select>

        <select value={filters.role} onChange={(event) => set("role", event.target.value as RoleFilter)} className={selectClass}>
          <option value="ALL">Vai trò: Tất cả</option>
          <option value="MANAGER">Quản lý</option>
          <option value="EMPLOYEE">Nhân viên</option>
        </select>

        <button
          type="button"
          onClick={() => onChange(EMPTY_FILTERS)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-100"
        >
          <X className="h-3.5 w-3.5" />
          Đặt lại
        </button>
      </div>
    </div>
  );
}
