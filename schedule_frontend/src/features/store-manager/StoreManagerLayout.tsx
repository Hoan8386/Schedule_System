"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Calendar,
  CheckSquare,
  FileCheck,
  FileText,
  LayoutDashboard,
  ListTodo,
  MessageSquare,
  ShieldAlert,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AppShell, initialsOf, usePageNavigation, type NavSection } from "@/components/layout";
import StoreManagerDashboard from "@/features/store-manager/StoreManagerDashboard";
import StoreManagerViolationPage from "@/features/store-manager/vi-pham/StoreManagerViolationPage";
import StoreManagerTodoListPage from "@/features/store-manager/todo/StoreManagerTodoListPage";
import StoreManagerTestManagementPage from "@/features/store-manager/bai-test/StoreManagerTestManagementPage";
import FeedbackPage from "@/features/feedback/FeedbackPage";
import StoreManagerShiftHubPage, { type ShiftHubTab } from "@/features/store-manager/quan-ly-ca/StoreManagerShiftHubPage";
import NhanSuPage from "@/features/management/nhan-su/NhanSuPage";

const SECTIONS: NavSection[] = [
  {
    items: [
      { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
      // Đăng ký ca + xử lý yêu cầu ca + lịch làm việc gộp vào Quản lý ca (giống UI trang Quản lý);
      // Xuất danh sách ca nằm trong Lịch làm việc ở chế độ Danh sách
      { id: "quanlyca", label: "Quản lý ca", icon: Calendar },
      { id: "nhansu", label: "Quản lý nhân sự", icon: Users },
      { id: "vipham", label: "Xử lý vi phạm", icon: ShieldAlert, badge: "2" },
      { id: "phanhoi", label: "Quản lý phản hồi", icon: MessageSquare },
      { id: "lapbienban", label: "Lập biên bản", icon: FileText },
      { id: "ketquatest", label: "Kết quả bài test", icon: CheckSquare },
      { id: "mytest", label: "Bài test của tôi", icon: BookOpen },
      { id: "quanlytest", label: "Quản lý bài test", icon: FileCheck },
      { id: "todo", label: "Todo list", icon: ListTodo, badge: "3" },
    ],
  },
];

export default function StoreManagerLayout() {
  const { user, logout } = useAuth();
  const { activePage: activeTab, navigate: setActiveTab, navigating } = usePageNavigation("dashboard");
  // Mở Quản lý ca ở đúng tab con (từ Tổng quan)
  const [shiftTab, setShiftTab] = useState<{ tab: ShiftHubTab; version: number }>({ tab: "lich", version: 0 });
  const openShifts = (tab: ShiftHubTab) => {
    setShiftTab((current) => ({ tab, version: current.version + 1 }));
    setActiveTab("quanlyca");
  };

  const renderPage = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <StoreManagerDashboard
            onGoToRequests={() => openShifts("yeucau")}
            onGoToMyShift={() => openShifts("dangky")}
            onGoToTodos={() => setActiveTab("todo")}
          />
        );
      case "quanlyca":
        return <StoreManagerShiftHubPage key={shiftTab.version} initialTab={shiftTab.tab} />;
      case "nhansu":
        return <NhanSuPage readOnly />;
      case "vipham":
        return <StoreManagerViolationPage />;
      case "lapbienban":
        return <StoreManagerViolationPage initialTab="lapbienban" />;
      case "phanhoi":
        return <FeedbackPage role="STORE_MANAGER" />;
      case "todo":
        return <StoreManagerTodoListPage />;
      case "quanlytest":
      case "ketquatest":
      case "mytest":
        return <StoreManagerTestManagementPage mode={activeTab} />;
      default:
        return null;
    }
  };

  return (
    <AppShell
      subtitle="Workforce Management"
      scope={{ label: "Không gian trưởng cửa hàng", name: "BLOAN · Nguyễn Trãi", detail: "Phạm vi cố định · 1 cửa hàng" }}
      sections={SECTIONS}
      activeId={activeTab}
      onSelect={setActiveTab}
      navigating={navigating}
      breadcrumbRoot="Trưởng cửa hàng"
      topbarExtra={
        <span className="hidden rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 sm:inline-block">BLOAN · Nguyễn Trãi</span>
      }
      helpMessage="Tổng đài hỗ trợ vận hành cửa hàng: 1900 8386"
      helpLabel="Trung tâm hỗ trợ"
      showCopyright
      user={{
        initials: initialsOf(user?.fullName, user?.username, "TH"),
        name: user?.fullName || "Trưởng cửa hàng",
        subtitle: `${user?.storeCode || "CH001"} · Trưởng cửa hàng`,
        email: user?.email,
      }}
      onLogout={logout}
    >
      {renderPage()}
    </AppShell>
  );
}
