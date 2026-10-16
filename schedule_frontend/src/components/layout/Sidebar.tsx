import React from "react";
import Image from "next/image";
import { ChevronsUpDown, HelpCircle, LogOut } from "lucide-react";
import { cn } from "@/lib/cn";
import type { NavItem, NavSection, WorkspaceScope } from "./types";

interface SidebarProps {
  subtitle: string;
  scope: WorkspaceScope;
  sections: NavSection[];
  activeId: string;
  onSelect: (id: string) => void;
  /** "soft": mục đang chọn nền nhạt; "solid": nền brand đậm. */
  variant?: "soft" | "solid";
  helpMessage: string;
  helpLabel?: string;
  onLogout: () => void;
  showCopyright?: boolean;
}

export function Sidebar({
  subtitle,
  scope,
  sections,
  activeId,
  onSelect,
  variant = "soft",
  helpMessage,
  helpLabel = "Trợ giúp & Hỗ trợ",
  onLogout,
  showCopyright,
}: SidebarProps) {
  return (
    <aside className="z-20 flex w-(--sidebar-width) shrink-0 flex-col justify-between border-r border-slate-200/80 bg-surface shadow-sm">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-slate-100 p-4">
          <Image src="/logo/logo1.jpg" alt="BLOAN Logo" width={48} height={48} className="h-12 w-12 shrink-0 rounded-xl object-contain shadow-sm" />
          <div>
            <div className="text-base font-extrabold leading-tight tracking-tight text-accent">Ăn Vặt BLOAN</div>
            <div className="text-[11px] font-medium text-slate-400">{subtitle}</div>
          </div>
        </div>

        <div className="p-3">
          <div
            className={cn(
              "flex items-center justify-between rounded-xl border p-2.5",
              scope.tone === "neutral" ? "border-slate-200/70 bg-slate-50" : "border-brand-200/70 bg-brand-50/40"
            )}
          >
            <div>
              <p className={cn("text-[10px] font-bold uppercase tracking-wider", scope.tone === "neutral" ? "text-slate-400" : "text-brand-800")}>
                {scope.label}
              </p>
              <p className="mt-0.5 text-xs font-black text-slate-800">{scope.name}</p>
              {scope.detail && <p className="mt-0.5 text-[10px] text-slate-400">{scope.detail}</p>}
            </div>
            <ChevronsUpDown className="h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        <nav className="mt-1 flex-1 space-y-4 overflow-y-auto px-2">
          {sections.map((section, index) => (
            <div key={section.title ?? index}>
              {section.title && (
                <p className="mb-1.5 flex items-center justify-between px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span>{section.title}</span>
                  {section.tag && <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[9px] font-black text-brand-800">{section.tag}</span>}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavButton key={item.id} item={item} active={activeId === item.id} variant={variant} onClick={() => onSelect(item.id)} />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="shrink-0 space-y-1 border-t border-slate-100 p-3">
        <button
          type="button"
          onClick={() => alert(helpMessage)}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-500 transition-all hover:bg-slate-100/80"
        >
          <HelpCircle className="h-4 w-4 text-slate-400" />
          <span>{helpLabel}</span>
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-rose-600 transition-all hover:bg-rose-50"
        >
          <LogOut className="h-4 w-4" />
          <span>Đăng xuất</span>
        </button>
        {showCopyright && <div className="px-3 pt-2 text-[10px] font-medium text-slate-400">© 2026 Ăn Vặt BLOAN</div>}
      </div>
    </aside>
  );
}

function NavButton({ item, active, variant, onClick }: { item: NavItem; active: boolean; variant: "soft" | "solid"; onClick: () => void }) {
  const Icon = item.icon;
  const activeClass =
    variant === "solid"
      ? "bg-brand-500 font-bold text-brand-contrast shadow-sm shadow-brand-200"
      : "border border-brand-200/60 bg-brand-50/80 font-bold text-brand-800 shadow-xs";
  const iconClass = active ? (variant === "solid" ? "text-brand-contrast" : "text-brand-600") : "text-slate-400";
  const badgeClass =
    item.badgeTone === "success"
      ? "bg-emerald-100 text-emerald-700"
      : active && variant === "solid"
        ? "bg-slate-900 text-brand-300"
        : "bg-brand-100 text-brand-800";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all",
        active ? activeClass : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
      )}
    >
      <div className="flex items-center gap-2.5 truncate">
        <Icon className={cn("h-4 w-4 shrink-0", iconClass)} />
        <span className="truncate">{item.label}</span>
      </div>
      {item.badge !== undefined && item.badge !== "" && (
        <span className={cn("shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold", badgeClass)}>{item.badge}</span>
      )}
    </button>
  );
}
