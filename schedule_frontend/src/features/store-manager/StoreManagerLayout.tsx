"use client";

import React from "react";
import {
  BookOpen,
  Calendar,
  CalendarPlus,
  CheckSquare,
  FileCheck,
  FileText,
  Inbox,
  LayoutDashboard,
  ListTodo,
  MessageSquare,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AppShell, initialsOf, usePageNavigation, type NavSection } from "@/components/layout";
import StoreManagerDashboard from "@/features/store-manager/StoreManagerDashboard";
import StoreManagerShiftRequestsPage from "@/features/store-manager/yeu-cau/StoreManagerShiftRequestsPage";
import StoreManagerViolationPage from "@/features/store-manager/vi-pham/StoreManagerViolationPage";
import StoreManagerTodoListPage from "@/features/store-manager/todo/StoreManagerTodoListPage";
import StoreManagerTestManagementPage from "@/features/store-manager/bai-test/StoreManagerTestManagementPage";
import FeedbackPage from "@/features/feedback/FeedbackPage";
import StoreManagerMyShiftPage from "@/features/store-manager/StoreManagerMyShiftPage";
import StoreManagerSchedulePage from "@/features/store-manager/lich/StoreManagerSchedulePage";
import StoreManagerRegisterShiftPage from "@/features/store-manager/dang-ky-ca/StoreManagerRegisterShiftPage";

const SECTIONS: NavSection[] = [
  {
    items: [
      { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
      { id: "yeucau", label: "Xử lý yêu cầu ca", icon: Inbox, badge: "6 chờ duyệt" },
      { id: "lichcuatoi", label: "Lịch làm việc", icon: Calendar },
      { id: "dangkyca", label: "Đăng ký ca", icon: CalendarPlus },
      { id: "vipham", label: "Xử lý vi phạm", icon: ShieldAlert, badge: "2" },
      { id: "xuatca", label: "Xuất danh sách ca", icon: CalendarPlus },
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

  const renderPage = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <StoreManagerDashboard
            onGoToRequests={() => setActiveTab("yeucau")}
            onGoToMyShift={() => setActiveTab("dangkyca")}
            onGoToTodos={() => setActiveTab("todo")}
          />
        );
      case "yeucau":
        return <StoreManagerShiftRequestsPage />;
      case "lichcuatoi":
        return <StoreManagerSchedulePage onGoToRequests={() => setActiveTab("yeucau")} />;
      case "dangkyca":
        return <StoreManagerRegisterShiftPage />;
      case "xuatca":
        return <StoreManagerMyShiftPage exportOnly />;
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
