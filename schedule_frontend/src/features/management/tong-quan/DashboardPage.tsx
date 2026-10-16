"use client";

import React from "react";
import { CalendarCheck, Plus, Store, Users } from "lucide-react";
import { AttendanceTrendChart, RequestStatusChart, StaffByStoreChart } from "./Charts";
import { ManagerTodos, RecentRequestsTable, RecentViolations } from "./Widgets";

const STATS = [
  { label: "Cửa hàng hoạt động", value: "24 cửa hàng", hint: "100% đang mở cửa hoạt động", icon: <Store className="h-4 w-4" />, tone: "bg-blue-50 text-blue-600" },
  { label: "Tổng nhân sự chuỗi", value: "1.250 nhân sự", hint: "98.5% tỷ lệ chấm công đúng giờ", icon: <Users className="h-4 w-4" />, tone: "bg-emerald-50 text-emerald-600" },
  { label: "Ca làm hôm nay", value: "450 ca", hint: "12 yêu cầu đang chờ phê duyệt", icon: <CalendarCheck className="h-4 w-4" />, tone: "bg-brand-50 text-brand-600" },
  { label: "Ngân sách lương T10", value: "2.4 Tỷ VND", hint: "Ước tính theo tiến độ 05/10", icon: <span className="text-xs font-bold">₫</span>, tone: "bg-emerald-50 text-emerald-700" },
];

/** Tổng quan hoạt động toàn chuỗi cho quản lý. */
export default function DashboardPage() {
  return (
    <div className="page">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">Tổng quan hệ thống</h1>
          <p className="mt-1 text-xs text-slate-500">Theo dõi toàn bộ hoạt động chuỗi 24 cửa hàng và 1.250 nhân sự Ăn Vặt BLOAN.</p>
        </div>
        <button onClick={() => alert("Mở cấu hình lịch ca toàn chuỗi")} className="btn btn-primary px-5 shadow-sm shadow-brand-200">
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>Tạo kỳ ca mới</span>
        </button>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="font-semibold text-slate-600">Tháng 10/2026 · Toàn chuỗi BLOAN · Lũy kế thời gian thực</span>
        <span className="rounded-md bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">Phạm vi: Toàn hệ thống (24 cửa hàng)</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-surface p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">{stat.label}</span>
              <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${stat.tone}`}>{stat.icon}</div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black tracking-tight text-slate-800">{stat.value}</div>
              <div className="mt-1 text-[11px] font-medium text-slate-400">{stat.hint}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <AttendanceTrendChart />
        <RequestStatusChart />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <StaffByStoreChart />
        <ManagerTodos />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <RecentRequestsTable />
        <RecentViolations />
      </div>
    </div>
  );
}
