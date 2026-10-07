"use client";

import React, { useState } from "react";
import {
  Users,
  UserCheck,
  UserMinus,
  Plane,
  Shuffle,
  Pencil,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  Upload,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  TrendingUp,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const statsCards = [
  {
    label: "Tổng nhân sự toàn chuỗi",
    value: "1,248",
    sub: "+12 nhân sự tháng này",
    subColor: "text-emerald-600",
    icon: Users,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
  },
  {
    label: "Nhân viên chính thức",
    value: "842",
    sub: "Chiếm 67.5% tổng số",
    subColor: "text-slate-500",
    icon: UserCheck,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
  },
  {
    label: "Part-time / Thời vụ",
    value: "406",
    sub: "Chiếm 32.5% tổng số",
    subColor: "text-slate-500",
    icon: UserMinus,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50",
  },
  {
    label: "Nghỉ phép hôm nay",
    value: "14",
    sub: "Cần sắp xếp bù ca",
    subColor: "text-rose-500",
    icon: Plane,
    iconColor: "text-rose-600",
    iconBg: "bg-rose-50",
  },
];

const staffData = [
  {
    id: "NV-2023-001",
    name: "Nguyễn Thị Thu Hà",
    avatar: "TH",
    role: "CỬA HÀNG TRƯỞNG",
    roleColor: "bg-blue-50 text-blue-700 border border-blue-200",
    stores: ["BLOAN · Lê Lợi (Q1)", "BLOAN · Tú Xương (Q3)"],
    phone: "0987-123-456",
    startDate: "12/05/2021",
    active: true,
  },
  {
    id: "NV-2023-042",
    name: "Phạm Hoàng Nam",
    avatar: "PN",
    role: "NHÂN VIÊN CHÍNH THỨC",
    roleColor: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    stores: ["BLOAN · Giga Mall (Thủ Đức)"],
    phone: "0901-555-888",
    startDate: "10/01/2023",
    active: true,
  },
  {
    id: "NV-2023-015",
    name: "Lê Mai Anh",
    avatar: "LA",
    role: "PART-TIME",
    roleColor: "bg-amber-50 text-amber-700 border border-amber-200",
    stores: ["BLOAN · Crescent Mall (Q7)", "BLOAN · Nguyễn Trãi"],
    phone: "0933-444-222",
    startDate: "15/08/2023",
    active: false,
    statusLabel: "NGHỈ PHÉP",
  },
  {
    id: "NV-2023-008",
    name: "Trần Thế Vinh",
    avatar: "TV",
    role: "NHÂN VIÊN CHÍNH THỨC",
    roleColor: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    stores: ["BLOAN · CMT8 (Tân Bình)"],
    phone: "0912-333-777",
    startDate: "01/02/2022",
    active: true,
  },
  {
    id: "NV-2023-099",
    name: "Hoàng Minh Trí",
    avatar: "MT",
    role: "PART-TIME",
    roleColor: "bg-amber-50 text-amber-700 border border-amber-200",
    stores: ["BLOAN · Quang Trung (Gò Vấp)"],
    phone: "0944-888-999",
    startDate: "18/03/2024",
    active: true,
  },
];

const activityLog = [
  {
    name: "Hoàng Anh Thư",
    action: "được phân bổ thêm vào",
    store: "BLOAN · Quang Trung (Gò Vấp)",
    time: "20 phút trước",
    by: "Admin Hoàn",
    storeColor: "text-amber-700 bg-amber-50 border border-amber-200",
  },
  {
    name: "Lý Quốc Khánh",
    action: "chuyển trạng thái sang",
    store: "Đã nghỉ việc",
    time: "1 giờ trước",
    by: "Quản lý Vùng",
    storeColor: "text-rose-700 bg-rose-50 border border-rose-200",
  },
  {
    name: "Đỗ Hải Yến",
    action: "thăng chức lên",
    store: "Trưởng Cửa Hàng",
    time: "3 giờ trước",
    by: "Admin Hoàn",
    storeColor: "text-blue-700 bg-blue-50 border border-blue-200",
  },
];

const weeklyData = [
  { week: "Tuần 1", thucTe: 180, keHoach: 200 },
  { week: "Tuần 2", thucTe: 210, keHoach: 200 },
  { week: "Tuần 3", thucTe: 240, keHoach: 220 },
  { week: "Tuần 4", thucTe: 195, keHoach: 200 },
];

export default function NhanSuPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Quản lý nhân sự chuỗi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý danh sách nhân sự, chức vụ, điều phối chi nhánh và theo dõi nhân lực toàn hệ thống Ăn Vặt BLOAN.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => alert("Mở trình nhập danh sách nhân viên từ Excel...")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Import danh sách</span>
          </button>
          <button
            onClick={() => alert("Mở form thêm hồ sơ nhân viên mới...")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold transition-all shadow-sm shadow-amber-200"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm nhân viên</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-semibold text-slate-500">
                  {card.label}
                </span>
                <div className="text-2xl sm:text-3xl font-black text-slate-800 mt-1 tracking-tight">
                  {card.value}
                </div>
                <p className={`text-[11px] mt-1 font-semibold ${card.subColor}`}>
                  {card.sub}
                </p>
              </div>
              <div
                className={`w-10 h-10 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center shrink-0`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Filters */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, Mã NV, số điện thoại..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl outline-hidden hover:border-slate-300 focus:border-amber-400 transition-all font-medium text-slate-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 outline-hidden hover:border-slate-300">
              <option>Tất cả cửa hàng (24)</option>
              <option>BLOAN · Lê Lợi (Q1)</option>
              <option>BLOAN · Tú Xương (Q3)</option>
              <option>BLOAN · Giga Mall (Thủ Đức)</option>
              <option>BLOAN · Quang Trung</option>
            </select>

            <select className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 outline-hidden hover:border-slate-300">
              <option>Tất cả chức vụ</option>
              <option>Cửa hàng trưởng</option>
              <option>Nhân viên chính thức</option>
              <option>Part-time</option>
            </select>

            <select className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 outline-hidden hover:border-slate-300">
              <option>Tất cả trạng thái</option>
              <option>Đang làm việc</option>
              <option>Nghỉ phép</option>
              <option>Đã nghỉ việc</option>
            </select>

            <button
              onClick={() => alert("Đang làm mới dữ liệu nhân sự...")}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs"
              title="Làm mới"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3 w-10 text-center">
                  <input type="checkbox" className="rounded accent-amber-500" />
                </th>
                <th className="px-5 py-3">Nhân viên</th>
                <th className="px-5 py-3">Chức vụ</th>
                <th className="px-5 py-3">Cửa hàng phụ trách</th>
                <th className="px-5 py-3">Số điện thoại</th>
                <th className="px-5 py-3">Ngày bắt đầu</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {staffData.map((staff) => (
                <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 text-center">
                    <input type="checkbox" className="rounded accent-amber-500" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center border border-amber-200/80 shrink-0 shadow-2xs">
                        {staff.avatar}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{staff.name}</p>
                        <p className="text-[11px] text-slate-400 font-medium">Mã: {staff.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${staff.roleColor}`}>
                      {staff.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {staff.stores.map((s, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-600">{staff.phone}</td>
                  <td className="px-5 py-4 text-slate-500 font-medium">{staff.startDate}</td>
                  <td className="px-5 py-4">
                    {staff.statusLabel ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {staff.statusLabel}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        HOẠT ĐỘNG
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => alert(`Điều phối cửa hàng cho: ${staff.name}`)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-amber-600 transition-colors"
                        title="Điều phối ca/cửa hàng"
                      >
                        <Shuffle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => alert(`Sửa thông tin: ${staff.name}`)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => alert(`Xóa hồ sơ: ${staff.name}`)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3.5 bg-slate-50/30 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            Hiển thị <span className="font-bold text-slate-700">1 – 5</span> của{" "}
            <span className="font-bold text-slate-700">1,248</span> nhân sự toàn chuỗi
          </p>
          <div className="flex items-center gap-1.5">
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {["1", "2", "3", "..."].map((p, i) => (
              <button
                key={i}
                className={`w-8 h-8 rounded-lg font-bold transition-colors ${
                  p === "1"
                    ? "bg-amber-500 text-slate-900 shadow-2xs"
                    : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom section: activity log + chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Lịch sử điều phối gần đây</h3>
            </div>
            <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              Toàn hệ thống
            </span>
          </div>

          <div className="space-y-3.5">
            {activityLog.map((log, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/60 border border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-200">
                  {log.name.split(" ").slice(-1)[0].slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-700 leading-relaxed">
                    <span className="font-bold text-slate-800">{log.name}</span> {log.action}{" "}
                    <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${log.storeColor}`}>
                      {log.store}
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 font-medium">
                    {log.time} • Thực hiện bởi: <span className="text-slate-600 font-semibold">{log.by}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => alert("Xem toàn bộ lịch sử biến động nhân sự...")}
            className="mt-4 w-full py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors text-center"
          >
            Xem tất cả lịch sử biến động →
          </button>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Kế hoạch ca so với thực tế</h3>
              </div>
              <span className="text-xs font-bold text-slate-400">Tháng này</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Đối chiếu số lượng ca thực tế và kế hoạch điều phối theo 4 tuần gần nhất.
            </p>

            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                  }}
                />
                <Bar dataKey="thucTe" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Thực tế" />
                <Bar dataKey="keHoach" fill="#e2e8f0" radius={[6, 6, 0, 0]} name="Kế hoạch" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 pt-3 border-t border-slate-100">
            <span className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="w-3 h-3 rounded-md bg-amber-500 inline-block" /> Thực tế
            </span>
            <span className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="w-3 h-3 rounded-md bg-slate-200 inline-block" /> Kế hoạch
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
