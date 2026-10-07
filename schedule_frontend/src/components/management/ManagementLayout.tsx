"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import DashboardPage from "@/components/management/DashboardPage";
import NhanSuPage from "@/components/management/NhanSuPage";
import ChamCongPage from "@/components/management/ChamCongPage";
import YeuCauPage from "@/components/management/YeuCauPage";
import LichPage from "@/components/management/LichPage";
import NoiQuyPage from "@/components/management/NoiQuyPage";
import LuongPage from "@/components/management/LuongPage";
import ThongKePage from "@/components/management/ThongKePage";
import CuaHangPage from "@/components/management/CuaHangPage";
import PlaceholderPage from "@/components/management/PlaceholderPage";

const pageConfig: Record<string, { searchPlaceholder?: string; showStorePicker?: boolean; showHelp?: boolean; showSettings?: boolean }> = {
  dashboard: { searchPlaceholder: "Tìm kiếm nhân viên, cửa hàng...", showStorePicker: true, showSettings: true },
  chamcong: { searchPlaceholder: "Tìm kiếm chấm công...", showStorePicker: true, showSettings: true },
  yeucau: { searchPlaceholder: "Tìm kiếm mã yêu cầu, tên NV...", showStorePicker: true, showSettings: true },
  nhansu: { searchPlaceholder: "Tìm kiếm theo tên, mã NV hoặc SDT...", showHelp: true, showSettings: true },
  cuahang: { searchPlaceholder: "Tìm kiếm tên cửa hàng, mã CH..." },
  lich: { searchPlaceholder: "Tìm kiếm kỳ đăng ký, ca làm..." },
  noiquy: { searchPlaceholder: "Tìm kiếm vi phạm, nhân viên..." },
  luong: { searchPlaceholder: "Tìm kiếm nhân viên, cửa hàng, mã phiếu..." },
  thongke: { searchPlaceholder: "Tìm kiếm báo cáo...", showSettings: true },
};

export default function ManagementLayout() {
  const [activePage, setActivePage] = useState("dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <DashboardPage />;
      case "nhansu": return <NhanSuPage />;
      case "chamcong": return <ChamCongPage />;
      case "yeucau": return <YeuCauPage />;
      case "lich": return <LichPage />;
      case "noiquy": return <NoiQuyPage />;
      case "luong": return <LuongPage />;
      case "thongke": return <ThongKePage />;
      case "cuahang": return <CuaHangPage />;
      case "dangkyca": return <PlaceholderPage title="Đăng ký ca" description="Trang đăng ký ca làm việc đang được phát triển." />;
      case "feedback": return <PlaceholderPage title="Quản lý Feedback" description="Trang quản lý phản hồi khách hàng đang được phát triển." />;
      case "baitest": return <PlaceholderPage title="Quản lý bài Test" description="Trang quản lý bài kiểm tra nhân sự đang được phát triển." />;
      case "thanhtich": return <PlaceholderPage title="Đánh giá thành tích" description="Trang đánh giá thành tích nhân sự đang được phát triển." />;
      case "todo": return <PlaceholderPage title="Todo List" description="Trang quản lý công việc đang được phát triển." />;
      default: return <DashboardPage />;
    }
  };

  const config = pageConfig[activePage] || {};

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          searchPlaceholder={config.searchPlaceholder}
          showStorePicker={config.showStorePicker}
          showHelp={config.showHelp}
          showSettings={config.showSettings}
        />
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
