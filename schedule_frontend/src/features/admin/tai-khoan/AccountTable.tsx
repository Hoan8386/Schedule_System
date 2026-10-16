import React, { useState } from "react";
import { CheckCircle2, Edit, KeyRound, Lock, MoreHorizontal, RotateCcw, Search, Trash2, Unlock, Users } from "lucide-react";
import { roleBadgeClass, roleLabel, type AccountItem } from "./roles";
import { EMPTY_ACCOUNT_FILTERS } from "./useAccounts";

interface Props {
  accounts: AccountItem[];
  totalCount: number;
  filters: typeof EMPTY_ACCOUNT_FILTERS;
  onFiltersChange: (filters: typeof EMPTY_ACCOUNT_FILTERS) => void;
  onEdit: (account: AccountItem) => void;
  onToggleStatus: (account: AccountItem) => void;
  onDelete: (account: AccountItem) => void;
}

const control = "rounded-xl border border-slate-300 bg-white font-bold text-slate-800 outline-hidden hover:border-slate-400";

export function AccountTable({ accounts, totalCount, filters, onFiltersChange, onEdit, onToggleStatus, onDelete }: Props) {
  const [menuFor, setMenuFor] = useState<number | null>(null);
  const set = (key: keyof typeof filters, next: string) => onFiltersChange({ ...filters, [key]: next });

  return (
    <div className="overflow-visible rounded-2xl border border-slate-300 bg-surface shadow-xs">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-200 bg-slate-50 p-4 text-xs md:flex-row md:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm theo username hoặc ID..."
            value={filters.search}
            onChange={(event) => set("search", event.target.value)}
            className={`w-full py-2 pl-9 pr-3 transition-all placeholder:text-slate-400 focus:border-brand-500 ${control}`}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <select value={filters.role} onChange={(event) => set("role", event.target.value)} className={`px-3 py-2 ${control}`}>
            <option value="ALL">Tất cả vai trò</option>
            {["ADMIN", "MANAGER", "STORE_MANAGER", "EMPLOYEE"].map((code) => (
              <option key={code} value={code}>{roleLabel(code)}</option>
            ))}
          </select>
          <select value={filters.status} onChange={(event) => set("status", event.target.value)} className={`px-3 py-2 ${control}`}>
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="LOCKED">Đã khóa</option>
          </select>
          <button onClick={() => onFiltersChange(EMPTY_ACCOUNT_FILTERS)} className={`inline-flex cursor-pointer items-center gap-1.5 px-3 py-2 hover:bg-slate-100 ${control}`}>
            <RotateCcw className="h-3.5 w-3.5 text-slate-700" />
            <span>Đặt lại</span>
          </button>
        </div>
      </div>

      <div className="min-h-[300px] overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="whitespace-nowrap border-b border-slate-200 bg-slate-100 text-xs font-black uppercase tracking-wider text-slate-700">
              <th className="px-5 py-3.5">Tài khoản</th>
              <th className="px-5 py-3.5">Vai trò</th>
              <th className="px-5 py-3.5">Đăng nhập gần nhất</th>
              <th className="px-5 py-3.5 text-center">Trạng thái</th>
              <th className="px-5 py-3.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {accounts.map((account, index) => {
              const active = account.status === "ACTIVE";
              // Hai dòng cuối mở menu lên trên để không bị cắt
              const openUp = index >= accounts.length - 2 && accounts.length > 2;
              return (
                <tr key={account.id} className="transition-colors hover:bg-slate-50">
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-brand-200 bg-brand-100 text-xs font-black text-brand-900">
                        {account.username.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-slate-900">@{account.username}</span>
                      <span className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-700">#{account.id}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${roleBadgeClass(account.roleCode)}`}>{roleLabel(account.roleCode)}</span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold text-slate-800">{account.lastLogin}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-center">
                    <button
                      onClick={() => onToggleStatus(account)}
                      title="Nhấn để đổi trạng thái"
                      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold transition-all ${
                        active ? "border-emerald-300 bg-emerald-100 text-emerald-800 hover:bg-emerald-200" : "border-rose-300 bg-rose-100 text-rose-800 hover:bg-rose-200"
                      }`}
                    >
                      {active ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" /> : <Lock className="h-3.5 w-3.5 text-rose-700" />}
                      <span>{active ? "Hoạt động" : "Đã khóa"}</span>
                    </button>
                  </td>
                  <td className="relative whitespace-nowrap px-5 py-3.5 text-right">
                    <div className="inline-block text-left">
                      <button
                        onClick={() => setMenuFor(menuFor === account.id ? null : account.id)}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-2xs transition-colors hover:bg-slate-100"
                      >
                        <MoreHorizontal className="h-4 w-4 text-slate-700" />
                        <span>Thao tác</span>
                      </button>
                      {menuFor === account.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setMenuFor(null)} />
                          <div className={`absolute right-0 z-50 w-48 rounded-xl border border-slate-200 bg-white py-1.5 text-xs shadow-2xl ${openUp ? "bottom-full mb-1" : "top-full mt-1"}`}>
                            <MenuItem icon={<Edit className="h-3.5 w-3.5 text-brand-600" />} label="Sửa & Phân quyền" onClick={() => { setMenuFor(null); onEdit(account); }} />
                            <MenuItem
                              icon={active ? <Lock className="h-3.5 w-3.5 text-rose-600" /> : <Unlock className="h-3.5 w-3.5 text-emerald-600" />}
                              label={active ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                              onClick={() => { setMenuFor(null); onToggleStatus(account); }}
                            />
                            <MenuItem
                              icon={<KeyRound className="h-3.5 w-3.5 text-blue-600" />}
                              label="Cấp lại mật khẩu"
                              onClick={() => { setMenuFor(null); alert(`Mật khẩu tạm thời cho @${account.username} đã được cấp lại: Bloan@2026`); }}
                            />
                            <div className="my-1 border-t border-slate-100" />
                            <MenuItem danger icon={<Trash2 className="h-3.5 w-3.5 text-rose-600" />} label="Xóa tài khoản" onClick={() => { setMenuFor(null); onDelete(account); }} />
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {accounts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                  <Users className="mx-auto mb-2 h-8 w-8 stroke-[1.5] text-slate-300" />
                  <p className="text-sm font-semibold text-slate-600">Không tìm thấy tài khoản nào</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {totalCount === 0 ? "Hệ thống chưa có dữ liệu tài khoản từ backend hoặc chưa kết nối được." : "Không có tài khoản nào phù hợp với bộ lọc tìm kiếm."}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MenuItem({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left font-bold transition-colors ${danger ? "text-rose-700 hover:bg-rose-50" : "text-slate-800 hover:bg-brand-50"}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
