"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  Calendar,
  CalendarPlus,
  ArrowLeftRight,
  CalendarX,
  MessageSquare,
  TrendingUp,
  User,
  GraduationCap,
  HelpCircle,
  LogOut,
  Bell,
  ChevronDown,
  ChevronsUpDown,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import EmployeeDashboard from "@/components/employee/EmployeeDashboard";
import EmployeeSchedulePage from "@/components/employee/EmployeeSchedulePage";
import EmployeeRegisterShiftPage from "@/components/employee/EmployeeRegisterShiftPage";
import EmployeeStatsPage from "@/components/employee/EmployeeStatsPage";
import EmployeeProfilePage from "@/components/employee/EmployeeProfilePage";
import EmployeeFeedbackPage from "@/components/employee/EmployeeFeedbackPage";
import EmployeeTestPage from "@/components/employee/EmployeeTestPage";
import EmployeeShiftSwapModal from "@/components/employee/EmployeeShiftSwapModal";
import EmployeeShiftCancelModal from "@/components/employee/EmployeeShiftCancelModal";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

const menuItems: MenuItem[] = [
  { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { id: "lich", label: "Lịch làm việc", icon: Calendar },
  { id: "dangkyca", label: "Đăng ký ca", icon: CalendarPlus, badge: "Mở" },
  { id: "doica", label: "Đổi ca", icon: ArrowLeftRight },
  { id: "huyca", label: "Hủy ca", icon: CalendarX },
  { id: "feedback", label: "Feedback", icon: MessageSquare },
  { id: "thongke", label: "Thống kê ca làm & tiền", icon: TrendingUp },
  { id: "profile", label: "Thông tin cá nhân", icon: User },
  { id: "baitest", label: "Bài kiểm tra", icon: GraduationCap, badge: "1 mới" },
];

export default function EmployeeLayout() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // When clicking Đổi ca or Hủy ca from sidebar, open modal and switch to schedule or respective view
  const handleNavClick = (id: string) => {
    if (id === "doica") {
      setIsSwapModalOpen(true);
      return;
    }
    if (id === "huyca") {
      setIsCancelModalOpen(true);
      return;
    }
    setActiveTab(id);
  };

  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Tổng quan";
      case "lich":
        return "Lịch làm việc";
      case "dangkyca":
        return "Đăng ký ca";
      case "feedback":
        return "Feedback";
      case "thongke":
        return "Thống kê ca làm & tiền";
      case "profile":
        return "Thông tin cá nhân";
      case "baitest":
        return "Bài kiểm tra";
      default:
        return "Tổng quan";
    }
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
                src="/logo/logo1.jpg"
                alt="BLOAN Logo"
                width={36}
                height={36}
                className="object-contain rounded-lg"
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

          {/* Scope indicator */}
          <div className="p-3">
            <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-2.5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  KHÔNG GIAN NHÂN VIÊN
                </p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">
                  BLOAN · Nguyễn Trãi
                </p>
              </div>
              <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="px-2 space-y-0.5 mt-1 overflow-y-auto max-h-[calc(100vh-320px)]">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-amber-50/80 text-amber-800 font-bold border border-amber-200/60 shadow-xs"
                      : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-amber-600" : "text-slate-400"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        item.badge === "Mở"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
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
            onClick={() => alert("Tổng đài hỗ trợ nhân sự: 1900 8386 (Nhánh 1)")}
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
            <span>Nhân viên</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 font-bold">
              {getBreadcrumbTitle()}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 hidden sm:inline-block">
              Thứ Hai, 05/10/2026
            </span>

            {/* Notification bell */}
            <button
              onClick={() => alert("Thông báo: Kỳ đăng ký tuần 12 - 18/10 đang mở!")}
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
                  MA
                </div>
                <div className="text-left hidden md:block leading-tight">
                  <div className="text-xs font-bold text-slate-800">
                    {user?.fullName || "Nguyễn Minh Anh"}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {user?.storeCode || "NV024"} · Nhân viên bán hàng
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 text-xs">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-800">
                      {user?.fullName || "Nguyễn Minh Anh"}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {user?.email || "minhanh.nv024@bloan.vn"}
                    </p>
                  </div>

                  <div className="p-1">
                    <button
                      onClick={() => {
                        setActiveTab("profile");
                        setIsProfileOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-slate-100 rounded-lg text-slate-700"
                    >
                      Thông tin cá nhân
                    </button>
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
            <EmployeeDashboard
              onGoToSchedule={() => setActiveTab("lich")}
              onOpenSwap={() => setIsSwapModalOpen(true)}
              onOpenCancel={() => setIsCancelModalOpen(true)}
            />
          )}
          {activeTab === "lich" && (
            <EmployeeSchedulePage
              onOpenRegister={() => setActiveTab("dangkyca")}
              onOpenSwap={() => setIsSwapModalOpen(true)}
              onOpenCancel={() => setIsCancelModalOpen(true)}
            />
          )}
          {activeTab === "dangkyca" && <EmployeeRegisterShiftPage />}
          {activeTab === "thongke" && <EmployeeStatsPage />}
          {activeTab === "profile" && <EmployeeProfilePage />}
          {activeTab === "feedback" && <EmployeeFeedbackPage />}
          {activeTab === "baitest" && <EmployeeTestPage />}
        </main>
      </div>

      {/* Modals for Shift Swap and Shift Cancel */}
      <EmployeeShiftSwapModal
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
      />
      <EmployeeShiftCancelModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
      />
    </div>
  );
}
