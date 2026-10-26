import React, { useState } from "react";
import { ChevronDown, LogOut, Menu, Search } from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import type { ShellUser, UserMenuAction } from "./types";

interface TopbarProps {
  breadcrumbRoot: string;
  title: string;
  /** Nội dung thêm bên phải (ô tìm kiếm, chip cửa hàng, ngày...). */
  extra?: React.ReactNode;
  user: ShellUser;
  menuActions?: UserMenuAction[];
  onLogout: () => void;
  /** Mở trang theo id menu (bấm việc cần xử lý trên chuông thông báo) */
  onNavigate?: (page: string) => void;
  /** Mở menu trượt (nút chỉ hiện dưới lg) */
  onOpenNav?: () => void;
}

export function Topbar({ breadcrumbRoot, title, extra, user, menuActions = [], onLogout, onNavigate, onOpenNav }: TopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="z-10 flex h-(--topbar-height) shrink-0 items-center justify-between gap-2 border-b border-slate-200/80 bg-surface px-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-2 text-xs">
        {onOpenNav && (
          <button
            type="button"
            onClick={onOpenNav}
            aria-label="Mở menu"
            className="-ml-1 shrink-0 rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <span className="hidden shrink-0 font-semibold text-slate-400 md:inline">{breadcrumbRoot}</span>
        <span className="hidden text-slate-300 md:inline">/</span>
        <span className="truncate text-sm font-bold text-slate-800">{title}</span>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {extra}

        <NotificationBell onNavigate={onNavigate} />

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 py-1.5 pl-2 pr-2 transition-all hover:bg-slate-50 sm:pr-3"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 text-xs font-extrabold text-brand-contrast shadow-xs">
              {user.initials}
            </div>
            <div className="hidden text-left md:block">
              <div className="text-xs font-bold leading-tight text-slate-800">{user.name}</div>
              <div className="text-[10px] font-bold leading-tight text-brand-700">{user.subtitle}</div>
            </div>
            <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 sm:block" />
          </button>

          {menuOpen && (
            <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 z-50 mt-2 w-64 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-slate-200 bg-surface p-2 text-xs shadow-xl">
              <div className="border-b border-slate-100 p-3">
                <p className="text-sm font-bold text-slate-800">{user.name}</p>
                {user.email && <p className="mt-0.5 text-[11px] text-slate-400">{user.email}</p>}
                {user.roleBadge && (
                  <span className="mt-2 inline-block rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-800">{user.roleBadge}</span>
                )}
              </div>
              {menuActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => {
                    action.onClick();
                    setMenuOpen(false);
                  }}
                  className="mt-1 w-full rounded-xl px-3 py-2 text-left text-slate-700 transition-colors hover:bg-slate-100"
                >
                  {action.label}
                </button>
              ))}
              <button
                type="button"
                onClick={onLogout}
                className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-semibold text-rose-600 transition-colors hover:bg-rose-50"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Đăng xuất</span>
              </button>
            </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/** Ô tìm kiếm nhanh trên topbar. */
export function TopbarSearch({ placeholder }: { placeholder: string }) {
  return (
    <div className="relative hidden w-56 items-center md:flex">
      <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400" />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-700 outline-hidden transition-all hover:border-slate-300 focus:border-brand-400"
      />
    </div>
  );
}
