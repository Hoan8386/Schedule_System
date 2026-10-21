"use client";

import React, { useEffect, useRef } from "react";
import { PageTransitionOverlay } from "./PageTransitionOverlay";
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
  /** Đang chuyển trang → hiện overlay trên vùng nội dung */
  navigating?: boolean;
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
  navigating = false,
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
  const mainRef = useRef<HTMLElement>(null);

  // Trang mới luôn bắt đầu từ đầu thay vì giữ vị trí cuộn của trang cũ.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [activeId]);

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
          onNavigate={onSelect}
        />
        <div className="relative min-h-0 flex-1">
          <main ref={mainRef} className="h-full overflow-y-auto">{children}</main>
          <PageTransitionOverlay visible={navigating} />
        </div>
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
