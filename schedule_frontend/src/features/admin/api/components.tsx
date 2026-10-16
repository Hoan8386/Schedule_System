import React from "react";
import { Search } from "lucide-react";
import { METHOD_FILTERS, type MethodFilter } from "./apiCatalog";

/** Nhóm nút lọc theo phương thức HTTP. */
export function MethodPills({ value, onChange, className = "" }: { value: MethodFilter; onChange: (method: MethodFilter) => void; className?: string }) {
  return (
    <div className={`flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 ${className}`}>
      {METHOD_FILTERS.map((method) => (
        <button
          key={method}
          type="button"
          onClick={() => onChange(method)}
          className={`rounded-lg px-2.5 py-1 text-[10px] font-black transition-all ${value === method ? "bg-brand-500 text-brand-contrast shadow-xs" : "text-slate-500 hover:bg-slate-100"}`}
        >
          {method}
        </button>
      ))}
    </div>
  );
}

/** Ô tìm kiếm nhỏ có icon. */
export function SearchInput({ value, onChange, placeholder, className = "" }: { value: string; onChange: (value: string) => void; placeholder: string; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs font-medium text-slate-700 outline-hidden focus:border-brand-400"
      />
    </div>
  );
}
