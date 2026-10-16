import type React from "react";

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  /** Màu badge riêng (mặc định brand). */
  badgeTone?: "brand" | "success";
}

export interface NavSection {
  title?: string;
  /** Nhãn nhỏ cạnh tiêu đề nhóm, vd. "5 CHỨC NĂNG". */
  tag?: string;
  items: NavItem[];
}

export interface WorkspaceScope {
  /** Dòng nhỏ in hoa, vd. "KHÔNG GIAN QUẢN LÝ CHUỖI" */
  label: string;
  name: string;
  detail?: string;
  tone?: "brand" | "neutral";
}

export interface ShellUser {
  initials: string;
  name: string;
  subtitle: string;
  email?: string;
  roleBadge?: string;
}

export interface UserMenuAction {
  label: string;
  onClick: () => void;
}
