"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import type { NavSection, ShellUser, UserMenuAction, WorkspaceScope } from "./types";

export interface AppShellProps {
  /** Dòng phụ dưới logo */
  subtitle: string;
  scope: WorkspaceScope;
  sections: NavSection[];
  activeId: string;
  onSelect: (id: string) => void;
  navVariant?: "soft" | "solid";
  breadcrumbRoot: string;
  topbarExtra?: React.ReactNode;
  helpMessage: string;
  helpLabel?: string;
  showCopyright?: boolean;
  user: ShellUser;
  userMenuActions?: UserMenuAction[];
  onLogout: () => void;
  children: React.ReactNode;
}

/** Khung giao diện chung (sidebar + topbar + vùng nội dung) cho mọi vai trò. */
export function AppShell({
  subtitle,
  scope,
  sections,
  activeId,
  onSelect,
  navVariant,
  breadcrumbRoot,
  topbarExtra,
  helpMessage,
  helpLabel,
  showCopyright,
  user,
  userMenuActions,
  onLogout,
  children,
}: AppShellProps) {
  const title = sections.flatMap((section) => section.items).find((item) => item.id === activeId)?.label ?? "Tổng quan";

  return (
    <div className="flex h-screen overflow-hidden bg-app font-sans text-slate-800">
      <Sidebar
        subtitle={subtitle}
        scope={scope}
        sections={sections}
        activeId={activeId}
        onSelect={onSelect}
        variant={navVariant}
        helpMessage={helpMessage}
        helpLabel={helpLabel}
        onLogout={onLogout}
        showCopyright={showCopyright}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar
          breadcrumbRoot={breadcrumbRoot}
          title={title}
          extra={topbarExtra}
          user={user}
          menuActions={userMenuActions}
          onLogout={onLogout}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

/** Chữ viết tắt từ họ tên / tên đăng nhập. */
export function initialsOf(fullName?: string | null, username?: string | null, fallback = "NV") {
  if (fullName) return fullName.trim().split(/\s+/).slice(-1)[0].slice(0, 2).toUpperCase();
  if (username) return username.slice(0, 2).toUpperCase();
  return fallback;
}
