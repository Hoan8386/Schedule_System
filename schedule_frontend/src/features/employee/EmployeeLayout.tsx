"use client";

import React, { useState } from "react";
import {
  Calendar,
  CalendarPlus,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  TrendingUp,
  User,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AppShell, initialsOf, usePageNavigation, type NavSection } from "@/components/layout";
import EmployeeDashboard from "@/features/employee/EmployeeDashboard";
import EmployeeSchedulePage from "@/features/employee/EmployeeSchedulePage";
import EmployeeRegisterShiftPage from "@/features/employee/dang-ky-ca/EmployeeRegisterShiftPage";
import type { ShiftRequestType } from "@/features/employee/doi-huy-ca/model";
import EmployeeStatsPage from "@/features/employee/EmployeeStatsPage";
import EmployeeProfilePage from "@/features/employee/EmployeeProfilePage";
import FeedbackPage from "@/features/feedback/FeedbackPage";
import EmployeeTestPage from "@/features/employee/bai-kiem-tra/EmployeeTestPage";

const SECTIONS: NavSection[] = [
  {
    items: [
      { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
      { id: "lich", label: "Lịch làm việc", icon: Calendar },
      { id: "dangkyca", label: "Đăng ký ca", icon: CalendarPlus, badge: "Mở", badgeTone: "success" },
      { id: "feedback", label: "Feedback", icon: MessageSquare },
      { id: "thongke", label: "Thống kê ca làm & tiền", icon: TrendingUp },
      { id: "profile", label: "Thông tin cá nhân", icon: User },
      { id: "baitest", label: "Bài kiểm tra", icon: GraduationCap, badge: "1 mới" },
    ],
  },
];

export default function EmployeeLayout() {
  const { user, logout } = useAuth();
  const { activePage: activeTab, navigate: setActiveTab, navigating } = usePageNavigation("dashboard");
  // Đặt lịch khẩn (thêm / đổi / hủy ca) nằm ở Lịch làm việc: mở trang kèm popup chọn sẵn loại
  const [urgent, setUrgent] = useState<{ type: ShiftRequestType; version: number } | null>(null);
  const openUrgent = (type: ShiftRequestType) => {
    setUrgent((current) => ({ type, version: (current?.version ?? 0) + 1 }));
    setActiveTab("lich");
  };
  const selectPage = (id: string) => {
    if (id === "lich") setUrgent(null);
    setActiveTab(id);
  };

  const renderPage = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <EmployeeDashboard
            onGoToSchedule={() => setActiveTab("lich")}
            onOpenSwap={() => openUrgent("CHANGE")}
            onOpenCancel={() => openUrgent("CANCEL")}
          />
        );
      case "lich":
        return (
          <EmployeeSchedulePage
            key={urgent?.version ?? 0}
            initialUrgentType={urgent?.type}
            onOpenRegister={() => setActiveTab("dangkyca")}
          />
        );
      case "dangkyca":
        return <EmployeeRegisterShiftPage />;
      case "thongke":
        return <EmployeeStatsPage />;
      case "profile":
        return <EmployeeProfilePage />;
      case "feedback":
        return <FeedbackPage role="EMPLOYEE" />;
      case "baitest":
        return <EmployeeTestPage />;
      default:
        return null;
    }
  };

  return (
    <>
      <AppShell
        subtitle="Workforce Management"
        scope={{ label: "Không gian nhân viên", name: "BLOAN · Nguyễn Trãi", tone: "neutral" }}
        sections={SECTIONS}
        activeId={activeTab}
        onSelect={selectPage}
        navigating={navigating}
        breadcrumbRoot="Nhân viên"
        topbarExtra={<span className="hidden text-xs text-slate-400 sm:inline-block">Thứ Hai, 05/10/2026</span>}
        helpMessage="Tổng đài hỗ trợ nhân sự: 1900 8386 (Nhánh 1)"
        helpLabel="Trung tâm hỗ trợ"
        showCopyright
        user={{
          initials: initialsOf(user?.fullName, user?.username, "NV"),
          name: user?.fullName || "Nhân viên",
          subtitle: `${user?.storeCode || "NV"} · Nhân viên bán hàng`,
          email: user?.email,
        }}
        userMenuActions={[{ label: "Thông tin cá nhân", onClick: () => setActiveTab("profile") }]}
        onLogout={logout}
      >
        {renderPage()}
      </AppShell>
    </>
  );
}
