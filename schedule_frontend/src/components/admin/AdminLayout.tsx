"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  ShieldCheck,
  Palette,
  Code,
  FileDigit,
  Mail,
  Users,
  Store,
  Clock,
  Wallet,
  TrendingUp,
  HelpCircle,
  LogOut,
  Bell,
  ChevronDown,
  ChevronsUpDown,
  Search,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AdminDashboardPage from "@/components/admin/AdminDashboardPage";
import QuanLyTaiKhoanPage from "@/components/admin/QuanLyTaiKhoanPage";
import ThongTinThuongHieuPage from "@/components/admin/ThongTinThuongHieuPage";
import QuanLyApiPage from "@/components/admin/QuanLyApiPage";
import CauHinhSinhMaPage from "@/components/admin/CauHinhSinhMaPage";
import QuanLyEmailThongBaoPage from "@/components/admin/QuanLyEmailThongBaoPage";
import NhanSuPage from "@/components/management/NhanSuPage";
import CuaHangPage from "@/components/management/CuaHangPage";
import ChamCongPage from "@/components/management/ChamCongPage";
import LuongPage from "@/components/management/LuongPage";
import ThongKePage from "@/components/management/ThongKePage";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

const adminCoreMenuItems: MenuItem[] = [
  { id: "dashboard", label: "Bàn làm việc Admin", icon: LayoutDashboard },
  { id: "taikhoan", label: "Quản lý tài khoản (phân quyền)", icon: ShieldCheck, badge: "156" },
  { id: "thuonghieu", label: "Quản lý thông tin cửa hàng (logo, màu sắc)", icon: Palette },
  { id: "api", label: "Quản lý API & Thiết bị", icon: Code, badge: "Active" },
  { id: "sinhma", label: "Cấu hình sinh mã tự động", icon: FileDigit },
  { id: "email_thongbao", label: "Quản lý thông báo & Gửi Email", icon: Mail },
];

const operationsMenuItems: MenuItem[] = [
  { id: "nhansu", label: "Dữ liệu nhân sự chuỗi", icon: Users },
  { id: "cuahang", label: "Mạng lưới cửa hàng", icon: Store },
  { id: "chamcong", label: "Đối soát chấm công", icon: Clock },
  { id: "luong", label: "Quỹ lương & Thưởng", icon: Wallet },
  { id: "thongke", label: "Báo cáo tổng hợp", icon: TrendingUp },
];

export default function AdminLayout() {
  const { user, logout, switchRole } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const allItems = [...adminCoreMenuItems, ...operationsMenuItems];

  const getBreadcrumbTitle = () => {
    const item = allItems.find((m) => m.id === activeTab);
    return item ? item.label : "Bàn làm việc Admin";
  };

  const renderPage = () => {
    switch (activeTab) {
      case "dashboard":
        return <AdminDashboardPage onNavigate={setActiveTab} />;
      case "taikhoan":
        return <QuanLyTaiKhoanPage />;
      case "thuonghieu":
        return <ThongTinThuongHieuPage />;
      case "api":
        return <QuanLyApiPage />;
      case "sinhma":
        return <CauHinhSinhMaPage />;
      case "email_thongbao":
        return <QuanLyEmailThongBaoPage />;
      // Operation oversight pages
      case "nhansu":
        return <NhanSuPage />;
      case "cuahang":
        return <CuaHangPage />;
      case "chamcong":
        return <ChamCongPage />;
      case "luong":
        return <LuongPage />;
      case "thongke":
        return <ThongKePage />;
      default:
        return <AdminDashboardPage onNavigate={setActiveTab} />;
    }
  };

  const userInitial = user?.fullName
    ? user.fullName.split(" ").slice(-1)[0].slice(0, 2).toUpperCase()
    : user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "AD";

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden text-slate-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 shadow-sm z-20">
        <div className="flex flex-col min-h-0 flex-1">
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
                Quản Trị Hệ Thống (ADMIN)
              </div>
            </div>
          </div>

          {/* Scope indicator: Administrator */}
          <div className="p-3">
            <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-2.5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-amber-800 uppercase tracking-wider">
                  CỔNG QUẢN TRỊ VIÊN (ADMIN)
                </p>
                <p className="text-xs font-black text-slate-800 mt-0.5">
                  BLOAN · Toàn hệ thống
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Quyền hạn: Root Administrator
                </p>
              </div>
              <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          {/* Scrollable Navigation Items */}
          <nav className="px-2 space-y-4 mt-1 overflow-y-auto flex-1">
            {/* Section 1: Admin Core Functions */}
            <div>
              <p className="px-3 text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Quản trị hệ thống</span>
                <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-black">
                  ADMIN
                </span>
              </p>
              <div className="space-y-0.5">
                {adminCoreMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
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
              </div>
            </div>

            {/* Section 2: Chain Oversight */}
            <div>
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Giám sát chuỗi (Oversight)
              </p>
              <div className="space-y-0.5">
                {operationsMenuItems.map((item) => {
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
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>

        {/* Bottom Footer Actions */}
        <div className="p-3 border-t border-slate-100 space-y-1 shrink-0">
          <button
            onClick={() => alert("Tổng đài hỗ trợ vận hành chuỗi: 1900 8386 (Phím 1)")}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-100/80 transition-all text-left"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Trợ giúp & Hỗ trợ</span>
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-all text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất hệ thống</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 shrink-0 z-10">
          {/* Breadcrumb / Title */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-400">Admin Portal</span>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-800 text-sm">{getBreadcrumbTitle()}</span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Quick Search */}
            <div className="hidden md:flex items-center relative w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tài khoản, API, mã..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden hover:border-slate-300 focus:border-amber-400 transition-all text-slate-700 font-medium"
              />
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => alert("Hệ thống hoạt động bình thường, không có cảnh báo nghiêm trọng.")}
              className="relative p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Thông báo"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
            </button>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-900 font-extrabold text-xs flex items-center justify-center shadow-xs">
                  {userInitial}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    {user?.fullName || user?.username || "Admin Hoàn"}
                  </div>
                  <div className="text-[10px] text-amber-700 font-bold leading-tight">
                    Quản trị viên (ADMIN)
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Menu Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-3 border-b border-slate-100">
                    <p className="font-bold text-slate-800 text-sm">
                      {user?.fullName || user?.username}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{user?.email}</p>
                    <span className="mt-2 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      Vai trò: ADMIN (Quản trị viên)
                    </span>
                  </div>

                  {/* Switch Demo Roles */}
                  <div className="p-2 border-b border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
                      Chuyển đổi giao diện Demo:
                    </p>
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          switchRole("ADMIN");
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 font-bold transition-colors flex items-center justify-between"
                      >
                        <span>1. Quản trị viên (ADMIN)</span>
                        <span className="text-[10px] text-amber-700 font-bold">Hiện tại</span>
                      </button>
                      <button
                        onClick={() => {
                          switchRole("MANAGER");
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 font-medium transition-colors flex items-center justify-between"
                      >
                        <span>2. Quản lý chuỗi (MANAGER)</span>
                        <span className="text-[10px] text-slate-400">Vận hành</span>
                      </button>
                      <button
                        onClick={() => {
                          switchRole("STORE_MANAGER");
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 font-medium transition-colors flex items-center justify-between"
                      >
                        <span>3. Trưởng cửa hàng</span>
                        <span className="text-[10px] text-slate-400">Quản lý ca</span>
                      </button>
                      <button
                        onClick={() => {
                          switchRole("EMPLOYEE");
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 font-medium transition-colors flex items-center justify-between"
                      >
                        <span>4. Nhân viên</span>
                        <span className="text-[10px] text-slate-400">Xem ca & đăng ký</span>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 font-semibold transition-colors flex items-center gap-2 mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto">{renderPage()}</main>
      </div>
    </div>
  );
}
