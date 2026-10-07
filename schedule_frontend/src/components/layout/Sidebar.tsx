"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  Clock,
  FileCheck2,
  CalendarDays,
  BarChart3,
  Users,
  Store,
  Calendar,
  Scale,
  Wallet,
  MessageSquare,
  ClipboardList,
  Award,
  CheckSquare,
  HelpCircle,
  LogOut,
  Zap,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type NavItem = {
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
  group?: string;
};

const navItems: NavItem[] = [
  { label: "Dashboard", icon: <LayoutDashboard size={18} />, href: "dashboard" },
  { label: "Quản lý chấm công", icon: <Clock size={18} />, href: "chamcong" },
  { label: "Xử lý yêu cầu", icon: <FileCheck2 size={18} />, href: "yeucau", badge: 12 },
  { label: "Đăng ký ca", icon: <CalendarDays size={18} />, href: "dangkyca" },
  { label: "Thống kê", icon: <BarChart3 size={18} />, href: "thongke" },
  { label: "Quản lý nhân sự", icon: <Users size={18} />, href: "nhansu", group: "MANAGEMENT" },
  { label: "Quản lý cửa hàng", icon: <Store size={18} />, href: "cuahang", group: "MANAGEMENT" },
  { label: "Quản lý lịch", icon: <Calendar size={18} />, href: "lich", group: "MANAGEMENT" },
  { label: "Nội quy & vi phạm", icon: <Scale size={18} />, href: "noiquy", group: "MANAGEMENT" },
  { label: "Quản lý lương", icon: <Wallet size={18} />, href: "luong", group: "MANAGEMENT" },
  { label: "Quản lý Feedback", icon: <MessageSquare size={18} />, href: "feedback", group: "MANAGEMENT" },
  { label: "Quản lý bài Test", icon: <ClipboardList size={18} />, href: "baitest", group: "MANAGEMENT" },
  { label: "Đánh giá thành tích", icon: <Award size={18} />, href: "thanhtich", group: "MANAGEMENT" },
  { label: "Todo List", icon: <CheckSquare size={18} />, href: "todo", group: "MANAGEMENT" },
];

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const { user, logout } = useAuth();

  const topItems = navItems.filter((i) => !i.group);
  const mgmtItems = navItems.filter((i) => i.group === "MANAGEMENT");

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0 overflow-y-auto">
      {/* Brand */}
      <div className="px-4 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center shadow-sm">
            <Zap size={18} className="text-white fill-white" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-slate-800">WORKFORCE</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-3 pb-2 space-y-0.5 overflow-y-auto">
        {topItems.map((item) => (
          <NavButton key={item.href} item={item} active={activePage === item.href} onClick={() => onNavigate(item.href)} />
        ))}

        <div className="pt-4 pb-1">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Management</p>
        </div>

        {mgmtItems.map((item) => (
          <NavButton key={item.href} item={item} active={activePage === item.href} onClick={() => onNavigate(item.href)} />
        ))}
      </nav>

      {/* Footer links */}
      <div className="border-t border-slate-100 px-3 py-3 space-y-0.5">
        <NavButton
          item={{ label: "Trung tâm hỗ trợ", icon: <HelpCircle size={18} />, href: "support" }}
          active={false}
          onClick={() => {}}
        />
        <NavButton
          item={{ label: "Đăng xuất", icon: <LogOut size={18} />, href: "logout" }}
          active={false}
          onClick={logout}
          danger
        />
        <p className="text-[10px] text-slate-400 px-3 pt-1">© 2026 Ăn Vặt BLOAN</p>
      </div>

      {/* User profile at very bottom */}
      <div className="border-t border-slate-100 px-3 py-3">
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center border-2 border-amber-200 text-sm shrink-0">
            {user?.username ? user.username.slice(0, 2).toUpperCase() : "AD"}
          </div>
          <div className="flex-1 text-left overflow-hidden">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {user?.fullName || user?.username || "Quản lý"}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {user?.roleName || (user?.roleCode === "ADMIN" ? "Quản trị viên" : "Quản lý chuỗi")}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavButton({
  item,
  active,
  onClick,
  danger,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 text-left ${
        active
          ? "bg-amber-400 text-white shadow-sm"
          : danger
          ? "text-red-500 hover:bg-red-50"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <span className={active ? "text-white" : danger ? "text-red-500" : "text-slate-500"}>
        {item.icon}
      </span>
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? "bg-white/30 text-white" : "bg-red-100 text-red-600"}`}>
          {item.badge}
        </span>
      )}
    </button>
  );
}
