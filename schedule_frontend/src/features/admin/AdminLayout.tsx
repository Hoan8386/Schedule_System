"use client";

import React from "react";
import { Code, FileDigit, Mail, MessageSquare, Palette, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AppShell, initialsOf, usePageNavigation, TopbarSearch, type NavSection } from "@/components/layout";
import QuanLyTaiKhoanPage from "@/features/admin/tai-khoan/QuanLyTaiKhoanPage";
import ThongTinThuongHieuPage from "@/features/admin/thuong-hieu/ThongTinThuongHieuPage";
import QuanLyApiPage from "@/features/admin/api/QuanLyApiPage";
import CauHinhSinhMaPage from "@/features/admin/CauHinhSinhMaPage";
import QuanLyEmailThongBaoPage from "@/features/admin/thong-bao/QuanLyEmailThongBaoPage";
import FeedbackPage from "@/features/feedback/FeedbackPage";

const PhanHoiPage = () => <FeedbackPage role="ADMIN" />;

const PAGES: Record<string, React.ComponentType> = {
  taikhoan: QuanLyTaiKhoanPage,
  thuonghieu: ThongTinThuongHieuPage,
  api: QuanLyApiPage,
  sinhma: CauHinhSinhMaPage,
  email_thongbao: QuanLyEmailThongBaoPage,
  phanhoi: PhanHoiPage,
};

const SECTIONS: NavSection[] = [
  {
    title: "Quản trị hệ thống",
    tag: "6 CHỨC NĂNG",
    items: [
      { id: "taikhoan", label: "Quản lý tài khoản", icon: ShieldCheck, badge: "RBAC" },
      { id: "thuonghieu", label: "Quản lý chuỗi cửa hàng", icon: Palette },
      { id: "api", label: "Quản lý API", icon: Code, badge: "Endpoints" },
      { id: "sinhma", label: "Cấu hình sinh mã tự động", icon: FileDigit },
      { id: "email_thongbao", label: "Quản lý thông báo & Email", icon: Mail },
      { id: "phanhoi", label: "Phản hồi", icon: MessageSquare },
    ],
  },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { activePage: activeTab, navigate: setActiveTab, navigating } = usePageNavigation("taikhoan");
  const Page = PAGES[activeTab] ?? QuanLyTaiKhoanPage;

  return (
    <AppShell
      subtitle="Quản Trị Hệ Thống (ADMIN)"
      scope={{ label: "Cổng quản trị viên (ADMIN)", name: "BLOAN · Toàn hệ thống", detail: "Quyền hạn: Root Administrator" }}
      sections={SECTIONS}
      activeId={activeTab}
      onSelect={setActiveTab}
      navigating={navigating}
      navVariant="solid"
      breadcrumbRoot="Admin Portal"
      topbarExtra={<TopbarSearch placeholder="Tìm tài khoản, API, mã..." />}
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
