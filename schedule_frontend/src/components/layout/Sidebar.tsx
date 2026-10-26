import React from "react";
import Image from "next/image";
import { X } from "lucide-react";
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
  /** Dưới lg: sidebar là menu trượt, hiện khi open = true. */
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({
  sections,
  activeId,
  onSelect,
  variant = "soft",
  showCopyright,
  open = false,
  onClose,
}: SidebarProps) {
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-(--sidebar-width) max-w-[85vw] shrink-0 flex-col justify-between border-r border-slate-200/80 bg-surface shadow-sm transition-transform duration-200",
          "lg:static lg:z-20 lg:max-w-none lg:translate-x-0",
          open ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="relative border-b border-slate-100 px-4 pt-4 pb-2">
          <Image src="/logo/logo1.jpg" alt="BLOAN Logo" width={2560} height={1810} priority className="h-24 w-full object-cover" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng menu"
            className="absolute right-2 top-2 rounded-lg bg-surface/90 p-1.5 text-slate-500 shadow-xs hover:bg-slate-100 lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
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

      {showCopyright && (
        <div className="shrink-0 border-t border-slate-100 px-6 py-3 text-[10px] font-medium text-slate-400">© 2026 Ăn Vặt BLOAN</div>
      )}
      </aside>
    </>
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
        "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs lg:py-2 font-semibold transition-all",
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
