"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  Inbox,
  CalendarPlus,
  ShieldAlert,
  TrendingUp,
  MessageSquare,
  MessageCircle,
  FileText,
  CheckSquare,
  BookOpen,
  FileCheck,
  ListTodo,
  HelpCircle,
  LogOut,
  Bell,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import StoreManagerDashboard from "@/components/store-manager/StoreManagerDashboard";
import StoreManagerShiftRequestsPage from "@/components/store-manager/StoreManagerShiftRequestsPage";
import StoreManagerViolationPage from "@/components/store-manager/StoreManagerViolationPage";
import StoreManagerTodoListPage from "@/components/store-manager/StoreManagerTodoListPage";
import StoreManagerTestManagementPage from "@/components/store-manager/StoreManagerTestManagementPage";
import StoreManagerStatsPage from "@/components/store-manager/StoreManagerStatsPage";
import StoreManagerFeedbackPage from "@/components/store-manager/StoreManagerFeedbackPage";
import StoreManagerMyShiftPage from "@/components/store-manager/StoreManagerMyShiftPage";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

const menuItems: MenuItem[] = [
  { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { id: "yeucau", label: "Xử lý yêu cầu ca", icon: Inbox, badge: "6 chờ duyệt" },
  { id: "dangkyca", label: "Đăng ký ca của tôi", icon: CalendarPlus },
  { id: "vipham", label: "Xử lý vi phạm", icon: ShieldAlert, badge: "2" },
  { id: "thongke", label: "Thống kê ca làm & tiền", icon: TrendingUp },
  { id: "feedback_hethong", label: "Feedback hệ thống", icon: MessageSquare },
  { id: "feedback_nhanvien", label: "Feedback nhân viên", icon: MessageCircle },
  { id: "lapbienban", label: "Lập biên bản", icon: FileText },
  { id: "ketquatest", label: "Kết quả bài test", icon: CheckSquare },
  { id: "mytest", label: "Bài test của tôi", icon: BookOpen },
  { id: "quanlytest", label: "Quản lý bài test", icon: FileCheck },
  { id: "todo", label: "Todo list", icon: ListTodo, badge: "3" },
];

export default function StoreManagerLayout() {
  const { user, logout, switchRole } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const getBreadcrumbTitle = () => {
    const item = menuItems.find((m) => m.id === activeTab);
    return item ? item.label : "Tổng quan";
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden text-slate-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 shadow-sm z-20">
        <div>
          {/* Logo Header */}
          <div className="p-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center p-1.5 shadow-sm shadow-amber-200/50">
              <Image
                src="/logo.png"
                alt="BLOAN Logo"
                width={36}
                height={36}
                className="object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
            <div>
              <div className="font-extrabold text-[#ED1C24] text-base leading-tight tracking-tight">
                Ăn Vặt BLOAN
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                Workforce Management
              </div>
            </div>
          </div>

          {/* Scope indicator: Store Manager */}
          <div className="p-3">
            <div className="bg-amber-50/40 border border-amber-200/70 rounded-xl p-2.5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                  KHÔNG GIAN TRƯỞNG CỬA HÀNG
                </p>
                <p className="text-xs font-black text-slate-800 mt-0.5">
                  BLOAN · Nguyễn Trãi
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Phạm vi cố định · 1 cửa hàng
                </p>
              </div>
              <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="px-2 space-y-0.5 mt-1 overflow-y-auto max-h-[calc(100vh-340px)]">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-amber-50/80 text-amber-800 font-bold border border-amber-200/60 shadow-xs"
                      : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-amber-600" : "text-slate-400"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 shrink-0">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Footer Actions */}
        <div className="p-3 border-t border-slate-100 space-y-1">
          <button
            onClick={() => alert("Tổng đài hỗ trợ vận hành cửa hàng: 1900 8386")}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-100/80 transition-all text-left"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Trung tâm hỗ trợ</span>
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50/80 transition-all text-left"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span>Đăng xuất</span>
          </button>
          <div className="px-3 pt-2 text-[10px] text-slate-400 font-medium">
            © 2026 Ăn Vặt BLOAN
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Trưởng cửa hàng</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 font-bold">
              {getBreadcrumbTitle()}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 hidden sm:inline-block">
              BLOAN · Nguyễn Trãi
            </span>

            {/* Notification bell */}
            <button
              onClick={() => alert("Thông báo: Có 6 yêu cầu ca đang chờ bạn xử lý.")}
              className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white" />
            </button>

            {/* User Profile Pill */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2.5 p-1 pl-1.5 pr-2 rounded-xl hover:bg-slate-50 border border-slate-200/80 transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">
                  TH
                </div>
                <div className="text-left hidden md:block leading-tight">
                  <div className="text-xs font-bold text-slate-800">
                    {user?.fullName || "Trần Thu Hà"}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {user?.storeCode || "CH001"} · Trưởng cửa hàng
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 text-xs">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-800">
                      {user?.fullName || "Trần Thu Hà"}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {user?.email || "thuha@bloan.vn"}
                    </p>
                  </div>

                  <div className="p-1 border-b border-slate-100">
                    <p className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase">
                      Chuyển chế độ xem (Demo)
                    </p>
                    <button
                      onClick={() => {
                        switchRole("ADMIN");
                        setIsProfileOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-slate-100 rounded-lg text-slate-700"
                    >
                      1. Quản trị viên (ADMIN)
                    </button>
                    <button
                      onClick={() => {
                        switchRole("MANAGER");
                        setIsProfileOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-slate-100 rounded-lg text-slate-700"
                    >
                      2. Quản lý chuỗi (MANAGER)
                    </button>
                    <button
                      onClick={() => {
                        switchRole("EMPLOYEE");
                        setIsProfileOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-slate-100 rounded-lg text-slate-700"
                    >
                      4. Nhân viên (EMPLOYEE)
                    </button>
                  </div>

                  <div className="p-1">
                    <button
                      onClick={logout}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-red-50 text-red-600 rounded-lg font-medium"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main View Router */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === "dashboard" && (
            <StoreManagerDashboard
              onGoToRequests={() => setActiveTab("yeucau")}
              onGoToMyShift={() => setActiveTab("dangkyca")}
            />
          )}
          {activeTab === "yeucau" && <StoreManagerShiftRequestsPage />}
          {activeTab === "dangkyca" && <StoreManagerMyShiftPage />}
          {activeTab === "vipham" && <StoreManagerViolationPage />}
          {activeTab === "lapbienban" && <StoreManagerViolationPage initialTab="lapbienban" />}
          {activeTab === "thongke" && <StoreManagerStatsPage />}
          {(activeTab === "feedback_hethong" || activeTab === "feedback_nhanvien") && (
            <StoreManagerFeedbackPage initialTab={activeTab === "feedback_hethong" ? "hethong" : "nhanvien"} />
          )}
          {activeTab === "todo" && <StoreManagerTodoListPage />}
          {(activeTab === "quanlytest" || activeTab === "ketquatest" || activeTab === "mytest") && (
            <StoreManagerTestManagementPage mode={activeTab} />
          )}
        </main>
      </div>
    </div>
  );
}
