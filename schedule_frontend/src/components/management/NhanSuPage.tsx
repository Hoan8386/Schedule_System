"use client";

import React, { useState } from "react";
import { Users, UserCheck, UserMinus, Shuffle, Pencil, Trash2, RefreshCw, Search, Filter, Upload, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const statsCards = [
  { label: "TỔNG NHÂN SỰ", value: "1,248", sub: "+12 ↑", subColor: "text-emerald-600", icon: <Users size={18} className="text-blue-600" />, iconBg: "bg-blue-100" },
  { label: "NHÂN VIÊN CHÍNH THỨC", value: "842", sub: "67.5%", subColor: "text-slate-500", icon: <UserCheck size={18} className="text-green-600" />, iconBg: "bg-green-100" },
  { label: "PART-TIME / CTV", value: "406", sub: "32.5%", subColor: "text-slate-500", icon: <UserMinus size={18} className="text-orange-500" />, iconBg: "bg-orange-100" },
  { label: "ĐANG NGHỈ PHÉP", value: "14", sub: "Hôm nay", subColor: "text-red-500", icon: <div className="text-red-500 text-base">✈</div>, iconBg: "bg-red-100" },
];

const staffData = [
  { id: "NV-2023-001", name: "Nguyễn Thị Thu Hà", avatar: "TH", role: "CỬA HÀNG TRƯỞNG", roleColor: "bg-blue-100 text-blue-700", stores: ["Store A - Quận 1", "Store B - Quận 3", "+1 store"], phone: "0987-123-456", startDate: "12/05/2021", active: true },
  { id: "NV-2023-042", name: "Phạm Hoàng Nam", avatar: "PN", role: "NHÂN VIÊN CHÍNH THỨC", roleColor: "bg-green-100 text-green-700", stores: ["Giga Mall - Thủ Đức"], phone: "0901-555-888", startDate: "10/01/2023", active: true },
  { id: "NV-2023-015", name: "Lê Mai Anh", avatar: "LA", role: "PART-TIME", roleColor: "bg-orange-100 text-orange-700", stores: ["Crescent Mall - Quận 7", "Store C - Bình Thạnh"], phone: "0933-444-222", startDate: "15/08/2023", active: false, statusLabel: "NGHỈ PHÉP" },
  { id: "NV-2023-008", name: "Trần Thế Vinh", avatar: "TV", role: "NHÂN VIÊN CHÍNH THỨC", roleColor: "bg-green-100 text-green-700", stores: ["Lê Văn Sỹ - Tân Bình"], phone: "0912-333-777", startDate: "01/02/2022", active: true },
];

const activityLog = [
  { name: "Hoàng Anh Thư", action: "được phân bổ thêm vào", store: "Store D - Gò Vấp", time: "20 phút trước", by: "Admin" },
  { name: "Lý Quốc Khánh", action: "chuyển trạng thái sang", store: "Đã nghỉ việc", time: "1 giờ trước", by: "Manager", storeColor: "text-red-500 bg-red-50" },
];

const weeklyData = [
  { week: "Tuần 1", thucTe: 180, keHoach: 200 },
  { week: "Tuần 2", thucTe: 210, keHoach: 200 },
  { week: "Tuần 3", thucTe: 240, keHoach: 220 },
  { week: "Tuần 4", thucTe: 80, keHoach: 200 },
];

export default function NhanSuPage() {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Quản lý nhân sự</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý thông tin, chức vụ và điều phối nhân sự tại các cửa hàng.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <Upload size={15} /> Import danh sách
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-white text-sm font-semibold transition-colors shadow-sm">
            <Plus size={15} /> Thêm nhân viên
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.label}</p>
              <div className={`w-8 h-8 rounded-lg ${card.iconBg} flex items-center justify-center`}>{card.icon}</div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900">
              {card.value} <span className={`text-sm font-semibold ${card.subColor}`}>{card.sub}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs">
        <div className="p-4 flex flex-wrap items-center gap-3 border-b border-slate-50">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input placeholder="Tìm kiếm theo tên, mã NV hoặc SĐT..." className="pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-300 w-64 placeholder:text-slate-400" />
          </div>
          <select className="text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-300">
            <option>Tất cả cửa hàng (24)</option>
            <option>Store A - Quận 1</option>
            <option>Giga Mall - Thủ Đức</option>
          </select>
          <select className="text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-300">
            <option>Tất cả chức vụ</option>
            <option>Cửa hàng trưởng</option>
            <option>Nhân viên chính thức</option>
            <option>Part-time</option>
          </select>
          <select className="text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-300">
            <option>Tất cả trạng thái</option>
            <option>Đang làm việc</option>
            <option>Nghỉ phép</option>
            <option>Đã nghỉ việc</option>
          </select>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 text-sm font-medium">
            <Filter size={14} /> Lọc dữ liệu
          </button>
          <button className="p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100">
            <RefreshCw size={14} />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3 text-left"><input type="checkbox" className="rounded" /></th>
                <th className="px-5 py-3 text-left">Nhân viên</th>
                <th className="px-5 py-3 text-left">Chức vụ</th>
                <th className="px-5 py-3 text-left">Cửa hàng phụ trách</th>
                <th className="px-5 py-3 text-left">Số điện thoại</th>
                <th className="px-5 py-3 text-left">Ngày bắt đầu</th>
                <th className="px-5 py-3 text-left">Trạng thái</th>
                <th className="px-5 py-3 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {staffData.map((staff) => (
                <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4"><input type="checkbox" className="rounded" /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 font-bold text-sm flex items-center justify-center border border-amber-200 shrink-0">
                        {staff.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{staff.name}</p>
                        <p className="text-[11px] text-slate-400">ID: {staff.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${staff.roleColor}`}>{staff.role}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {staff.stores.map((s, i) => (
                        <span key={i} className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${s.startsWith("+") ? "bg-slate-100 text-slate-600" : "bg-slate-100 text-slate-700"}`}>{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{staff.phone}</td>
                  <td className="px-5 py-4 text-slate-600">{staff.startDate}</td>
                  <td className="px-5 py-4">
                    {staff.statusLabel ? (
                      <span className="text-xs font-bold text-orange-500">{staff.statusLabel}</span>
                    ) : (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={staff.active} className="sr-only peer" />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:ring-2 peer-focus:ring-amber-300 rounded-full peer peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                      </label>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"><Shuffle size={14} /></button>
                      <button className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-colors"><Pencil size={14} /></button>
                      <button className="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">Hiển thị <strong>1 - 10</strong> của <strong>1,248</strong> kết quả &nbsp;|&nbsp; Dòng mỗi trang:
            <select className="ml-1 border border-slate-200 rounded px-1 py-0.5 text-sm">
              <option>10</option><option>20</option><option>50</option>
            </select>
          </p>
          <div className="flex items-center gap-1">
            {["«", "‹", "1", "2", "3", "›", "»"].map((p, i) => (
              <button key={i} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === "1" ? "bg-amber-400 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{p}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom section: activity log + chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-amber-500">🕐</span>
            <h3 className="font-bold text-slate-800">Lịch sử điều động gần đây</h3>
          </div>
          <div className="space-y-4">
            {activityLog.map((log, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center shrink-0">
                  {log.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold">{log.name}</span> {log.action}{" "}
                    <span className={`font-semibold px-1.5 py-0.5 rounded text-xs ${log.storeColor || "text-amber-700 bg-amber-50"}`}>{log.store}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{log.time} • Bởi: {log.by}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 text-amber-600 text-sm font-semibold hover:text-amber-700">Xem tất cả hoạt động →</button>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-blue-500">📈</span>
            <h3 className="font-bold text-slate-800">Tình hình nhân sự tháng này</h3>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklyData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Bar dataKey="thucTe" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Thực tế" />
              <Bar dataKey="keHoach" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Kế hoạch" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" /> Thực tế</span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-2.5 h-2.5 rounded-sm bg-slate-200 inline-block" /> Kế hoạch</span>
          </div>
        </div>
      </div>
    </div>
  );
}
