"use client";

import React, { useState } from "react";
import { Clock, AlertCircle, UserX, Timer, Search, Download, Upload, MoreVertical, CheckCircle2, AlertTriangle } from "lucide-react";

const statCards = [
  { label: "Tổng số ca (Hôm nay)", value: "450", sub: "↑ 12% so với hôm qua", subColor: "text-emerald-600", icon: <Clock size={18} className="text-blue-500" />, iconBg: "bg-blue-100" },
  { label: "Đi muộn / Về sớm", value: "28", sub: "Cần lưu ý", subColor: "text-red-500", icon: <AlertCircle size={18} className="text-orange-500" />, iconBg: "bg-orange-100" },
  { label: "Nghỉ không phép", value: "5", sub: "Đã thông báo bộ phận HR", subColor: "text-slate-500", icon: <UserX size={18} className="text-red-500" />, iconBg: "bg-red-100" },
  { label: "Đang chờ xác minh", value: "12", sub: "Yêu cầu điều chỉnh từ NV", subColor: "text-amber-600", icon: <Timer size={18} className="text-amber-500" />, iconBg: "bg-amber-100" },
];

const attendanceData = [
  {
    name: "Lê Thị Mai", id: "#NV-8821", store: "Q1 - Lê Lợi", date: "24/10/2023",
    shift: "08:00 - 17:00", checkIn: "07:55", checkOut: "17:05", diff: "-5m", diffColor: "text-slate-500",
    status: "HỢP LỆ", statusColor: "bg-green-100 text-green-700", icon: <CheckCircle2 size={16} className="text-emerald-500" />,
  },
  {
    name: "Trần Văn Nam", id: "#NV-3392", store: "Q3 - Tú Xương", date: "24/10/2023",
    shift: "08:00 - 17:00", checkIn: "08:15", checkOut: "17:02", diff: "+15m", diffColor: "text-amber-500",
    status: "VI PHẠM", statusColor: "bg-red-100 text-red-700", icon: <AlertCircle size={16} className="text-amber-500" />,
    checkInColor: "text-amber-600 font-bold",
  },
  {
    name: "Phạm Thu Thảo", id: "#NV-1044", store: "Q1 - Lê Lợi", date: "24/10/2023",
    shift: "13:00 - 22:00", checkIn: "12:50", checkOut: "--:--", diff: "N/A", diffColor: "text-slate-400",
    status: "CHỜ DUYỆT", statusColor: "bg-amber-100 text-amber-700", icon: <Timer size={16} className="text-amber-500" />,
  },
  {
    name: "Nguyễn Duy Mạnh", id: "#NV-2256", store: "Thủ Đức - Giga Mall", date: "24/10/2023",
    shift: "08:00 - 17:00", checkIn: "07:58", checkOut: "17:01", diff: "-2m", diffColor: "text-slate-500",
    status: "HỢP LỆ", statusColor: "bg-green-100 text-green-700", icon: <CheckCircle2 size={16} className="text-emerald-500" />,
  },
  {
    name: "Hoàng Anh Thư", id: "#NV-5501", store: "Q3 - Tú Xương", date: "24/10/2023",
    shift: "08:00 - 17:00", checkIn: "08:45", checkOut: "16:30", diff: "+75m", diffColor: "text-red-500",
    status: "VI PHẠM", statusColor: "bg-red-100 text-red-700", icon: <AlertTriangle size={16} className="text-red-500" />,
    checkInColor: "text-red-600 font-bold",
  },
];

export default function ChamCongPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <nav className="text-xs text-slate-400 mb-1">Quản lý <span className="mx-1">›</span> <span className="text-slate-600">Quản lý chấm công</span></nav>
          <h1 className="text-2xl font-extrabold text-slate-900">Quản lý chấm công</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <Download size={15} /> Xuất Excel
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-white text-sm font-semibold transition-colors shadow-sm">
            <Upload size={15} /> Import dữ liệu
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500 font-medium">{card.label}</p>
              <div className={`w-8 h-8 rounded-lg ${card.iconBg} flex items-center justify-center`}>{card.icon}</div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{card.value}</p>
            <p className={`text-xs mt-0.5 ${card.subColor}`}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs">
        <div className="p-4 flex flex-wrap items-center gap-3 border-b border-slate-50">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input placeholder="Tìm tên nhân viên, Mã NV..." className="pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-300 w-52 placeholder:text-slate-400" />
          </div>
          <select className="text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-300">
            <option>Tất cả cửa hàng</option>
            <option>Q1 - Lê Lợi</option>
            <option>Q3 - Tú Xương</option>
          </select>
          <select className="text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-300">
            <option>Hôm nay (24/10/2023)</option>
            <option>Hôm qua</option>
            <option>Tuần này</option>
          </select>
          <select className="text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-300">
            <option>Trạng thái: Tất cả</option>
            <option>Hợp lệ</option>
            <option>Vi phạm</option>
            <option>Chờ duyệt</option>
          </select>
          <button className="ml-auto text-amber-600 text-sm font-semibold hover:text-amber-700 transition-colors">Làm mới bộ lọc</button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3 text-left">Nhân viên</th>
                <th className="px-5 py-3 text-left">Cửa hàng</th>
                <th className="px-5 py-3 text-left">Ngày</th>
                <th className="px-5 py-3 text-left">Ca làm việc</th>
                <th className="px-5 py-3 text-left">Check-in</th>
                <th className="px-5 py-3 text-left">Check-out</th>
                <th className="px-5 py-3 text-left">Chênh lệch</th>
                <th className="px-5 py-3 text-left">Đối chiếu</th>
                <th className="px-5 py-3 text-left">Trạng thái</th>
                <th className="px-5 py-3 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {attendanceData.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
                        {row.name.split(" ").slice(-1)[0].slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{row.name}</p>
                        <p className="text-[11px] text-slate-400">{row.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600 text-xs">{row.store}</td>
                  <td className="px-5 py-4 text-slate-600">{row.date}</td>
                  <td className="px-5 py-4 text-slate-600">{row.shift}</td>
                  <td className={`px-5 py-4 ${row.checkInColor || "text-slate-700"}`}>{row.checkIn}</td>
                  <td className="px-5 py-4 text-slate-600">{row.checkOut}</td>
                  <td className={`px-5 py-4 font-semibold ${row.diffColor}`}>{row.diff}</td>
                  <td className="px-5 py-4">{row.icon}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${row.statusColor}`}>{row.status}</span>
                  </td>
                  <td className="px-5 py-4">
                    <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">Hiển thị <strong>1 - 5</strong> trong số <strong>1,250</strong> nhân viên</p>
          <div className="flex items-center gap-1">
            {["‹", "1", "2", "3", "...", "48", "›"].map((p, i) => (
              <button key={i} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === "1" ? "bg-amber-400 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
