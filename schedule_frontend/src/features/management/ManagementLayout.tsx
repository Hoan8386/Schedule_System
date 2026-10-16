"use client";

import React, { useState } from "react";
import {
  BellRing,
  Calendar,
  Clock,
  FileCheck,
  Inbox,
  LayoutDashboard,
  ShieldAlert,
  Store,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AppShell, initialsOf, TopbarSearch, type NavSection } from "@/components/layout";
import DashboardPage from "@/features/management/tong-quan/DashboardPage";
import NhanSuPage from "@/features/management/nhan-su/NhanSuPage";
import ChamCongPage from "@/features/management/ChamCongPage";
import YeuCauPage from "@/features/management/YeuCauPage";
import LichPage from "@/features/management/lich/LichPage";
import NoiQuyPage from "@/features/management/NoiQuyPage";
import LuongPage from "@/features/management/LuongPage";
import ThongKePage from "@/features/management/ThongKePage";
import CuaHangPage from "@/features/management/CuaHangPage";
import PhatThongBaoPage from "@/features/management/PhatThongBaoPage";
import QuanLyTestPage from "@/features/management/bai-test/QuanLyTestPage";

const PAGES: Record<string, React.ComponentType> = {
  dashboard: DashboardPage,
  nhansu: NhanSuPage,
  cuahang: CuaHangPage,
  chamcong: ChamCongPage,
  yeucau: YeuCauPage,
  lich: LichPage,
  noiquy: NoiQuyPage,
  luong: LuongPage,
  thongke: ThongKePage,
  phatthongbao: PhatThongBaoPage,
  quanlytest: QuanLyTestPage,
};

const SECTIONS: NavSection[] = [
  {
    title: "Vận hành chuỗi",
    items: [
      { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
      { id: "nhansu", label: "Quản lý nhân sự", icon: Users },
      { id: "cuahang", label: "Quản lý cửa hàng", icon: Store },
      { id: "chamcong", label: "Quản lý chấm công", icon: Clock },
      { id: "yeucau", label: "Xử lý yêu cầu", icon: Inbox },
      { id: "lich", label: "Quản lý lịch ca", icon: Calendar },
      { id: "noiquy", label: "Nội quy & vi phạm", icon: ShieldAlert },
      { id: "luong", label: "Quản lý lương & thưởng", icon: Wallet },
      { id: "thongke", label: "Thống kê & báo cáo", icon: TrendingUp },
      { id: "phatthongbao", label: "Phát thông báo", icon: BellRing },
      { id: "quanlytest", label: "Quản lý bài test", icon: FileCheck },
    ],
  },
];

export default function ManagementLayout() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const Page = PAGES[activeTab] ?? DashboardPage;
  const isAdmin = user?.roleCode === "ADMIN" || user?.role === "ADMIN";

  return (
    <AppShell
      subtitle="Workforce Management"
      scope={{
        label: isAdmin ? "Không gian quản trị viên" : "Không gian quản lý chuỗi",
        name: "BLOAN · Toàn hệ thống",
        detail: "Phạm vi: Toàn chuỗi (24 cửa hàng)",
      }}
      sections={SECTIONS}
      activeId={activeTab}
      onSelect={setActiveTab}
      breadcrumbRoot="Quản trị toàn hệ thống"
      topbarExtra={<TopbarSearch placeholder="Tìm nhân sự, cửa hàng, mã..." />}
      notificationMessage="Không có thông báo mới nào chưa đọc."
      helpMessage="Tổng đài hỗ trợ vận hành chuỗi: 1900 8386 (Phím 1)"
      user={{
        initials: initialsOf(user?.fullName, user?.username, "QL"),
        name: user?.fullName || user?.username || "Quản lý",
        subtitle: user?.roleName || user?.role || "Quản lý chuỗi",
        email: user?.email,
        roleBadge: `Vai trò: ${user?.roleCode || user?.role || "MANAGER"}`,
      }}
      onLogout={logout}
    >
      <Page />
    </AppShell>
  );
}
