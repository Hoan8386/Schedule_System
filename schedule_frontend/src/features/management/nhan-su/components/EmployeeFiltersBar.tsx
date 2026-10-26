import React from "react";
import { Search, X } from "lucide-react";
import type { StoreResponse } from "@/lib/api";
import { POSITION_OPTIONS, STATUS_OPTIONS, value } from "../utils";
import { EMPTY_FILTERS, type EmployeeFilters, type PositionFilter } from "../useEmployees";

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
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        <select value={filters.storeId} onChange={(event) => set("storeId", event.target.value)} className={selectClass}>
          <option value="ALL">Cửa hàng: Tất cả</option>
          {stores.map((store) => (
            <option key={store.id} value={store.id}>{value(store.storeName)}</option>
          ))}
        </select>

        <select value={filters.position} onChange={(event) => set("position", event.target.value as PositionFilter)} className={selectClass}>
          <option value="ALL">Vị trí: Tất cả</option>
          {POSITION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
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
