"use client";

import React from "react";
import Image from "next/image";
import {
  Calendar,
  Clock,
  LogOut,
  MapPin,
  CheckCircle,
  Bell,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function DashboardView() {
  const { user, logout } = useAuth();

  const mockShifts = [
    { day: "Thứ 2", date: "06/10", shift: "Ca Sáng (08:00 - 16:00)", status: "Đã hoàn thành", role: "Thu ngân & Bếp" },
    { day: "Thứ 3", date: "07/10", shift: "Ca Sáng (08:00 - 16:00)", status: "Đang diễn ra", role: "Quản lý ca" },
    { day: "Thứ 4", date: "08/10", shift: "Ca Chiều (16:00 - 23:00)", status: "Sắp tới", role: "Pha chế" },
    { day: "Thứ 5", date: "09/10", shift: "Ca Chiều (16:00 - 23:00)", status: "Sắp tới", role: "Pha chế" },
    { day: "Thứ 6", date: "10/10", shift: "Ca Tối (18:00 - 23:30)", status: "Sắp tới", role: "Thu ngân" },
    { day: "Thứ 7", date: "11/10", shift: "Nghỉ phép", status: "Off", role: "-" },
    { day: "Chủ nhật", date: "12/10", shift: "Ca Sáng (08:00 - 16:00)", status: "Sắp tới", role: "Trưởng ca" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-4">
            <div className="relative h-10 w-32 sm:w-36">
              <Image
                src="/logo/logo1.jpg"
                alt="Ăn Vặt BLOAN"
                fill
                priority
                sizes="(max-width: 640px) 128px, 144px"
                className="object-contain object-left"
              />
            </div>
            <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-slate-200 text-xs font-semibold text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Cổng Quản Lý Nhân Sự & Ca Làm
            </div>
          </div>

          {/* User profile & actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-bold text-slate-800">
                {user?.username || "Nhân viên BLOAN"}
              </span>
              <span className="text-[11px] text-slate-500">
                {user?.email || "nhanvien@bloan.vn"}
              </span>
            </div>

            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 font-bold flex items-center justify-center border border-amber-200 text-sm">
              {user?.username ? user.username.slice(0, 2).toUpperCase() : "NV"}
            </div>

            <button
              type="button"
              onClick={logout}
              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-1"
              title="Đăng xuất"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-orange-400 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-amber-500/15 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-2xl -mr-20 -mt-20 pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hệ thống phân ca tự động Ăn Vặt BLOAN</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Xin chào, {user?.username}!
            </h1>
            <p className="text-white/90 text-sm sm:text-base mt-2">
              Ca làm việc hôm nay của bạn: <span className="font-bold underline decoration-white/40">Ca Sáng (08:00 - 16:00)</span> tại Chi nhánh BLOAN Ba Đình.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => alert("Điểm danh vào ca thành công! Giờ ghi nhận: " + new Date().toLocaleTimeString("vi-VN"))}
                className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs sm:text-sm hover:bg-slate-50 transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Check-in ca làm việc</span>
              </button>

              <button
                type="button"
                onClick={() => alert("Yêu cầu đổi ca đã được chuyển tới quản lý cửa hàng.")}
                className="px-4 py-2.5 rounded-xl bg-black/15 hover:bg-black/25 text-white font-semibold text-xs sm:text-sm transition-all backdrop-blur-xs flex items-center gap-2 cursor-pointer"
              >
                <span>Yêu cầu đổi ca</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Giờ công tuần này</p>
              <h4 className="text-xl font-bold text-slate-800">38.5 giờ</h4>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">+4.5h so với tuần trước</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Trạng thái nhân sự</p>
              <h4 className="text-xl font-bold text-slate-800">ACTIVE</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Đã xác thực tài khoản</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Ca làm tiếp theo</p>
              <h4 className="text-xl font-bold text-slate-800">Ngày mai</h4>
              <p className="text-[11px] text-blue-600 font-semibold mt-0.5">16:00 - 23:00</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Cửa hàng làm việc</p>
              <h4 className="text-xl font-bold text-slate-800">BLOAN 01</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Chi nhánh Ba Đình, HN</p>
            </div>
          </div>
        </div>

        {/* Weekly Schedule Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Lịch phân ca làm việc tuần này
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cập nhật tự động từ hệ thống quản lý ca chuỗi Ăn Vặt BLOAN
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium px-3 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                Tuần 41 (06/10 - 12/10)
              </span>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3 px-4">Ngày</th>
                  <th className="py-3 px-4">Ca phân công</th>
                  <th className="py-3 px-4">Vị trí đảm nhiệm</th>
                  <th className="py-3 px-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {mockShifts.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {row.day} <span className="text-xs text-slate-400 font-normal">({row.date})</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {row.shift}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {row.role}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          row.status === "Đang diễn ra"
                            ? "bg-amber-100 text-amber-800 animate-pulse"
                            : row.status === "Đã hoàn thành"
                            ? "bg-emerald-100 text-emerald-800"
                            : row.status === "Off"
                            ? "bg-slate-100 text-slate-500"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Backend Connection Information Box */}
        <div className="bg-slate-900 rounded-2xl p-5 text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Kết nối Spring Boot API Backend thành công
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Endpoint: <code className="text-amber-400 font-mono">http://localhost:8080/api/v1/auth/*</code> · Xác thực qua JWT Bearer Token.
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            Đăng xuất tài khoản
          </button>
        </div>
      </main>
    </div>
  );
}
