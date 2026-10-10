"use client";

import React from "react";
import Image from "next/image";
import {
  ShieldCheck,
  Users,
  Store,
  KeyRound,
  FileDigit,
  Mail,
  Palette,
  Activity,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Server,
  Zap,
} from "lucide-react";

interface AdminDashboardProps {
  onNavigate: (tabId: string) => void;
}

export default function AdminDashboardPage({ onNavigate }: AdminDashboardProps) {
  const statCards = [
    {
      label: "Tài khoản hệ thống",
      value: "156",
      sub: "152 Đang hoạt động",
      badge: "RBAC Active",
      icon: Users,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      tab: "taikhoan",
    },
    {
      label: "Chi nhánh cửa hàng",
      value: "24",
      sub: "Toàn quốc (HN & HCM)",
      badge: "BLOAN Chain",
      icon: Store,
      color: "text-amber-700 bg-amber-50 border-amber-200",
      tab: "thuonghieu",
    },
    {
      label: "API Keys & Thiết bị",
      value: "4 Keys",
      sub: "POS, ZKTeco, Mobile App",
      badge: "99.8% Uptime",
      icon: KeyRound,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      tab: "api",
    },
    {
      label: "Quy tắc sinh mã",
      value: "5 Quy tắc",
      sub: "NV, S, CA, BBVP, PT",
      badge: "Tự động tăng",
      icon: FileDigit,
      color: "text-purple-700 bg-purple-50 border-purple-200",
      tab: "sinhma",
    },
  ];

  const adminModules = [
    {
      id: "taikhoan",
      title: "Quản lý tài khoản (Phân quyền)",
      desc: "Quản lý 156 tài khoản người dùng, phân cấp quyền hạn theo 4 nhóm vai trò (ADMIN, MANAGER, STORE_MANAGER, EMPLOYEE) và ma trận bảo mật RBAC.",
      icon: ShieldCheck,
      iconBg: "bg-blue-50 text-blue-600",
      badge: "156 Tài khoản",
      actionLabel: "Thiết lập phân quyền",
    },
    {
      id: "thuonghieu",
      title: "Quản lý chuỗi cửa hàng ",
      desc: "Tùy biến bộ nhận diện thương hiệu Ăn Vặt BLOAN, đổi logo thanh điều hướng, bảng màu chủ đạo (Primary/Accent) và thông tin pháp lý doanh nghiệp.",
      icon: Palette,
      iconBg: "bg-amber-50 text-amber-600",
      badge: "Live Preview",
      actionLabel: "Chỉnh sửa thương hiệu",
    },
    {
      id: "api",
      title: "Quản lý API & Cổng kết nối",
      desc: "Quản lý khóa bảo mật API Keys, giám sát 38 REST endpoints Spring Boot, kết nối máy chấm công vân tay ZKTeco và nhật ký truy vấn gateway.",
      icon: KeyRound,
      iconBg: "bg-emerald-50 text-emerald-600",
      badge: "Spring Boot API",
      actionLabel: "Quản lý API Keys",
    },
    {
      id: "sinhma",
      title: "Cấu hình sinh mã tự động",
      desc: "Định nghĩa quy tắc tạo mã duy nhất cho nhân viên (NV-2026-XXX), cửa hàng (BLOAN-SXX), ca làm việc (CA-XX) và biên bản vi phạm kỷ luật.",
      icon: FileDigit,
      iconBg: "bg-purple-50 text-purple-600",
      badge: "5 Quy tắc",
      actionLabel: "Tùy biến sinh mã",
    },
    {
      id: "email_thongbao",
      title: "Quản lý thông báo gửi Email / Thông báo khẩn",
      desc: "Cấu hình máy chủ SMTP, tùy biến 4 mẫu thư điện tử tự động (OTP, lịch ca, phiếu lương) và phát thông báo khẩn cấp tức thì đến 1,248 nhân sự.",
      icon: Mail,
      iconBg: "bg-rose-50 text-rose-600",
      badge: "SMTP Active",
      actionLabel: "Soạn thông báo & Email",
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900 shadow-2xs">
              ROOT ADMINISTRATOR
            </span>
            <span className="text-xs text-slate-300">Cổng Quản Trị Hệ Thống Ăn Vặt BLOAN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Trung Tâm Quản Trị Tối Cao (Admin Center)
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Kiểm soát toàn diện tài khoản, bảo mật phân quyền RBAC, thương hiệu chuỗi, cổng kết nối API và hệ thống phát thông báo toàn quốc.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xs p-2 border border-white/20 flex items-center justify-center shadow-xs">
            <Image
              src="/logo/logo1.jpg"
              alt="BLOAN"
              width={46}
              height={46}
              className="object-contain rounded-xl"
            />
          </div>
          <div>
            <p className="font-extrabold text-[#ED1C24] text-sm bg-white px-2 py-0.5 rounded-md inline-block">
              Ăn Vặt BLOAN
            </p>
            <p className="text-[11px] text-slate-300 mt-1">Phiên bản: v2.4.0 (Spring Boot 3 + Next.js)</p>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigate(card.tab)}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-amber-300 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{card.label}</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${card.color}`}>
                  {card.badge}
                </span>
              </div>
              <div className="my-3 flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                  {card.value}
                </span>
                <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-100">
                <span>{card.sub}</span>
                <span className="text-amber-700 font-bold flex items-center gap-0.5">
                  Quản lý <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5 Core Admin Modules */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">
              5 Phân Hệ Quản Trị Hệ Thống Cốt Lõi
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chọn phân hệ cần cấu hình để đi tới trang quản lý chi tiết
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
            Admin Authority Only
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {adminModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`w-11 h-11 rounded-2xl ${mod.iconBg} flex items-center justify-center font-bold shadow-2xs`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/60">
                      {mod.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-800 text-sm group-hover:text-amber-800 transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {mod.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => onNavigate(mod.id)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-50 group-hover:bg-amber-500 text-amber-900 group-hover:text-slate-900 border border-amber-200/80 text-xs font-bold transition-all shadow-2xs"
                  >
                    <span>{mod.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Health Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-sm">Trạng thái hạ tầng & Dịch vụ nền tảng</h3>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Tất cả dịch vụ hoạt động bình thường
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">Spring Boot Backend</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Port 8080 · Java 17</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">Database MySQL</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">HikariCP Pool: 10/10 Conn</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">SMTP Mail Server</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">smtp.gmail.com:587</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">Máy quét FaceID ZKTeco</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">24/24 Cửa hàng online</p>
          </div>
        </div>
      </div>
    </div>
  );
}
