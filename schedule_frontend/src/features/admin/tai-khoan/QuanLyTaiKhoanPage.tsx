"use client";

import React, { useState } from "react";
import { AlertCircle, Info, RefreshCw, ShieldCheck, UserCheck, Users, UserX } from "lucide-react";
import { useAccounts } from "./useAccounts";
import { AccountTable } from "./AccountTable";
import { EditAccountModal } from "./EditAccountModal";
import type { AccountItem } from "./roles";

export type { AccountItem } from "./roles";

/** Quản lý tài khoản: danh sách, khóa/mở khóa, sửa và gán vai trò. */
export default function QuanLyTaiKhoanPage() {
  const { accounts, filtered, roles, stores, loading, error, filters, setFilters, reload, toggleStatus, remove } = useAccounts();
  const [editing, setEditing] = useState<AccountItem | null>(null);

  const stats = [
    { label: "Tổng tài khoản", count: accounts.length, icon: Users, tone: "bg-brand-100 text-brand-800 border-brand-200" },
    {
      label: "Quản lý",
      count: accounts.filter((account) => account.roleCode === "MANAGER" || account.roleCode === "STORE_MANAGER").length,
      icon: ShieldCheck,
      tone: "bg-blue-100 text-blue-800 border-blue-200",
    },
    { label: "Nhân viên", count: accounts.filter((account) => account.roleCode === "EMPLOYEE").length, icon: UserCheck, tone: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    { label: "Tài khoản bị khóa", count: accounts.filter((account) => account.status === "LOCKED").length, icon: UserX, tone: "bg-rose-100 text-rose-800 border-rose-200" },
  ];

  return (
    <div className="page">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Quản lý tài khoản</h1>
          <div className="group relative">
            <button
              type="button"
              className="flex h-6 w-6 cursor-help items-center justify-center rounded-full border border-slate-300 bg-slate-200 font-bold text-slate-700 shadow-2xs transition-all hover:bg-brand-100 hover:text-brand-800"
              title="Thông tin phân quyền hệ thống"
            >
              <Info className="h-3.5 w-3.5 stroke-[2.5]" />
            </button>
            <div className="pointer-events-none absolute left-0 top-8 z-40 hidden w-80 rounded-xl border border-slate-700 bg-slate-900 p-3.5 text-white shadow-2xl group-hover:block">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-brand-400">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Phân quyền hệ thống</span>
              </div>
              <p className="text-xs font-medium leading-relaxed text-slate-200">
                Quản lý danh sách người dùng, cập nhật thông tin cá nhân và gán vai trò trực tiếp trong hệ thống.
              </p>
            </div>
          </div>
        </div>
        <button onClick={() => void reload()} disabled={loading} className="btn btn-secondary" title="Đồng bộ lại từ Backend Spring Boot">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-brand-600" : "text-slate-700"}`} />
          <span>{loading ? "Đang đồng bộ..." : "Tải lại dữ liệu"}</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-2xl border border-rose-300 bg-rose-50 p-4 text-xs font-semibold text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>
              Lỗi tải dữ liệu tài khoản từ backend: <strong className="font-bold">{error}</strong>
            </span>
          </div>
          <button onClick={() => void reload()} className="ml-4 cursor-pointer font-bold text-rose-900 underline hover:text-black">
            Thử lại
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, count, icon: Icon, tone }) => (
          <div key={label} className="flex items-center justify-between rounded-2xl border border-slate-300 bg-surface p-5 shadow-xs">
            <div>
              <span className="text-xs font-bold text-slate-700">{label}</span>
              <div className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{count}</div>
            </div>
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${tone}`}>
              <Icon className="h-5 w-5 stroke-[2.2]" />
            </div>
          </div>
        ))}
      </div>

      <AccountTable
        accounts={filtered}
        totalCount={accounts.length}
        filters={filters}
        onFiltersChange={setFilters}
        onEdit={setEditing}
        onToggleStatus={(account) => void toggleStatus(account)}
        onDelete={(account) => void remove(account)}
      />

      {editing && (
        <EditAccountModal
          account={editing}
          roles={roles}
          stores={stores}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            void reload();
          }}
        />
      )}
    </div>
  );
}
