"use client";

import React, { useState } from "react";
import {
  BookOpen,
  CalendarPlus,
  CheckSquare,
  FileCheck,
  FileText,
  Inbox,
  LayoutDashboard,
  ListTodo,
  MessageCircle,
  MessageSquare,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AppShell, initialsOf, type NavSection } from "@/components/layout";
import StoreManagerDashboard from "@/features/store-manager/StoreManagerDashboard";
import StoreManagerShiftRequestsPage from "@/features/store-manager/yeu-cau/StoreManagerShiftRequestsPage";
import StoreManagerViolationPage from "@/features/store-manager/vi-pham/StoreManagerViolationPage";
import StoreManagerTodoListPage from "@/features/store-manager/todo/StoreManagerTodoListPage";
import StoreManagerTestManagementPage from "@/features/store-manager/bai-test/StoreManagerTestManagementPage";
import StoreManagerFeedbackPage from "@/features/store-manager/StoreManagerFeedbackPage";
import StoreManagerMyShiftPage from "@/features/store-manager/StoreManagerMyShiftPage";

const SECTIONS: NavSection[] = [
  {
    items: [
      { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
      { id: "yeucau", label: "Xử lý yêu cầu ca", icon: Inbox, badge: "6 chờ duyệt" },
      { id: "dangkyca", label: "Đăng ký ca của tôi", icon: CalendarPlus },
      { id: "vipham", label: "Xử lý vi phạm", icon: ShieldAlert, badge: "2" },
      { id: "xuatca", label: "Xuất danh sách ca", icon: CalendarPlus },
      { id: "feedback_hethong", label: "Feedback hệ thống", icon: MessageSquare },
      { id: "feedback_nhanvien", label: "Feedback nhân viên", icon: MessageCircle },
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
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderPage = () => {
    switch (activeTab) {
      case "dashboard":
        return <StoreManagerDashboard onGoToRequests={() => setActiveTab("yeucau")} onGoToMyShift={() => setActiveTab("dangkyca")} />;
      case "yeucau":
        return <StoreManagerShiftRequestsPage />;
      case "dangkyca":
        return <StoreManagerMyShiftPage />;
      case "xuatca":
        return <StoreManagerMyShiftPage exportOnly />;
      case "vipham":
        return <StoreManagerViolationPage />;
      case "lapbienban":
        return <StoreManagerViolationPage initialTab="lapbienban" />;
      case "feedback_hethong":
        return <StoreManagerFeedbackPage initialTab="hethong" />;
      case "feedback_nhanvien":
        return <StoreManagerFeedbackPage initialTab="nhanvien" />;
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
      breadcrumbRoot="Trưởng cửa hàng"
      topbarExtra={
        <span className="hidden rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 sm:inline-block">BLOAN · Nguyễn Trãi</span>
      }
      notificationMessage="Thông báo: Có 6 yêu cầu ca đang chờ bạn xử lý."
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
