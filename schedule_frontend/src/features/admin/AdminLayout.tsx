"use client";

import React, { useState } from "react";
import { Code, FileDigit, Mail, Palette, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AppShell, initialsOf, TopbarSearch, type NavSection } from "@/components/layout";
import QuanLyTaiKhoanPage from "@/features/admin/tai-khoan/QuanLyTaiKhoanPage";
import ThongTinThuongHieuPage from "@/features/admin/thuong-hieu/ThongTinThuongHieuPage";
import QuanLyApiPage from "@/features/admin/api/QuanLyApiPage";
import CauHinhSinhMaPage from "@/features/admin/CauHinhSinhMaPage";
import QuanLyEmailThongBaoPage from "@/features/admin/thong-bao/QuanLyEmailThongBaoPage";

const PAGES: Record<string, React.ComponentType> = {
  taikhoan: QuanLyTaiKhoanPage,
  thuonghieu: ThongTinThuongHieuPage,
  api: QuanLyApiPage,
  sinhma: CauHinhSinhMaPage,
  email_thongbao: QuanLyEmailThongBaoPage,
};

const SECTIONS: NavSection[] = [
  {
    title: "Quản trị hệ thống",
    tag: "5 CHỨC NĂNG",
    items: [
      { id: "taikhoan", label: "Quản lý tài khoản", icon: ShieldCheck, badge: "RBAC" },
      { id: "thuonghieu", label: "Quản lý chuỗi cửa hàng", icon: Palette },
      { id: "api", label: "Quản lý API", icon: Code, badge: "Endpoints" },
      { id: "sinhma", label: "Cấu hình sinh mã tự động", icon: FileDigit },
      { id: "email_thongbao", label: "Quản lý thông báo & Email", icon: Mail },
    ],
  },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("taikhoan");
  const Page = PAGES[activeTab] ?? QuanLyTaiKhoanPage;

  return (
    <AppShell
      subtitle="Quản Trị Hệ Thống (ADMIN)"
      scope={{ label: "Cổng quản trị viên (ADMIN)", name: "BLOAN · Toàn hệ thống", detail: "Quyền hạn: Root Administrator" }}
      sections={SECTIONS}
      activeId={activeTab}
      onSelect={setActiveTab}
      navVariant="solid"
      breadcrumbRoot="Admin Portal"
      topbarExtra={<TopbarSearch placeholder="Tìm tài khoản, API, mã..." />}
      notificationMessage="Hệ thống hoạt động bình thường, không có cảnh báo nghiêm trọng."
      helpMessage="Tổng đài hỗ trợ vận hành chuỗi: 1900 8386 (Phím 1)"
      user={{
        initials: initialsOf(user?.fullName, user?.username, "AD"),
        name: user?.fullName || user?.username || "Quản trị viên",
        subtitle: "Quản trị viên (ADMIN)",
        email: user?.email,
        roleBadge: "Vai trò: ADMIN (Quản trị viên)",
      }}
      onLogout={logout}
    >
      <Page />
    </AppShell>
  );
}
