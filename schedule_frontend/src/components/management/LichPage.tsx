"use client";

import React from "react";
import { Plus, Copy, Pencil, Trash2, MoreVertical, Star } from "lucide-react";

const registrationPeriods = [
  {
    name: "Đăng ký ca Tháng 12/2023",
    sub: "Áp dụng cho: Toàn hệ thống",
    dateRange: "20/11/2023 - 30/11/2023",
    status: "ĐANG MỞ", statusColor: "bg-green-100 text-green-700",
    count: "124 ca",
  },
  {
    name: "Đăng ký ca Tháng 11/2023",
    sub: "Áp dụng cho: Toàn hệ thống",
    dateRange: "20/10/2023 - 30/10/2023",
    status: "ĐÃ ĐÓNG", statusColor: "bg-slate-100 text-slate-500",
    count: "124 ca",
  },
  {
    name: "Kỳ đăng ký Tết Dương Lịch 2024",
    sub: "Áp dụng cho: Khối cửa hàng",
    dateRange: "15/12/2023 - 25/12/2023",
    status: "DỰ THẢO", statusColor: "bg-blue-100 text-blue-600",
    count: "12 ca",
  },
];

const shifts = [
  { name: "Ca sáng", time: "08:00 - 12:00", pay: "200,000 VND", scope: "TOÀN HỆ THỐNG" },
  { name: "Ca chiều", time: "13:00 - 17:00", pay: "200,000 VND", scope: "TOÀN HỆ THỐNG" },
  { name: "Ca tối", time: "18:00 - 22:00", pay: "250,000 VND", scope: "TOÀN HỆ THỐNG" },
  { name: "Ca gãy (M)", time: "10:00 - 14:00 / 17:00 - 21:00", pay: "450,000 VND", scope: "CỬA HÀNG A, B" },
];

const specialEvents = [
  { name: "Giáng Sinh (Xmas)", date: "24/12 - 25/12", location: "Toàn hệ thống", tag: "x2 Lương", tagColor: "bg-green-100 text-green-700" },
  { name: "Khai trương Store C", date: "10/12/2023", location: "Chi nhánh Quận 7", tag: "+50k/Ca", tagColor: "bg-blue-100 text-blue-700" },
  { name: "Tết Dương Lịch 2024", date: "01/01/2024", location: "Toàn hệ thống", tag: "x3 Lương", tagColor: "bg-green-100 text-green-700" },
];

export default function LichPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Quản lý lịch & Ca làm</h1>
          <p className="text-sm text-slate-500 mt-1">Thiết lập kỳ đăng ký ca làm, định nghĩa ca và các sự kiện đặc biệt.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <Copy size={15} /> Nhân bản kỳ trước
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-white text-sm font-semibold transition-colors shadow-sm">
            <Plus size={15} /> Tạo kỳ đăng ký mới
          </button>
        </div>
      </div>

      {/* Registration Periods */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <span className="text-amber-400 text-lg">📋</span>
          <h3 className="font-bold text-slate-800">Danh sách kỳ đăng ký</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="px-5 py-3 text-left">Tên kỳ đăng ký</th>
              <th className="px-5 py-3 text-left">Thời gian đăng ký</th>
              <th className="px-5 py-3 text-left">Trạng thái</th>
              <th className="px-5 py-3 text-left">Số lượng ca</th>
              <th className="px-5 py-3 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {registrationPeriods.map((period, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-800">{period.name}</p>
                  <p className="text-xs text-slate-400">{period.sub}</p>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="text-slate-400">📅</span>
                    <span>{period.dateRange}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${period.statusColor}`}>{period.status}</span>
                </td>
                <td className="px-5 py-4 font-semibold text-slate-800">{period.count}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <button className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"><Pencil size={14} /></button>
                    <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"><Copy size={14} /></button>
                    <button className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Shifts + Special Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Shifts */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-blue-500">🕐</span>
              <h3 className="font-bold text-slate-800">Danh mục ca làm việc</h3>
            </div>
            <button className="text-amber-500 text-sm font-semibold hover:text-amber-600">+ Thêm ca mới</button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3 text-left">Tên ca</th>
                <th className="px-5 py-3 text-left">Khung giờ</th>
                <th className="px-5 py-3 text-left">Thù lao/ca</th>
                <th className="px-5 py-3 text-left">Phạm vi</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {shifts.map((shift, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-slate-800">{shift.name}</td>
                  <td className="px-5 py-3.5 text-slate-600">{shift.time}</td>
                  <td className="px-5 py-3.5 font-semibold text-green-600">{shift.pay}</td>
                  <td className="px-5 py-3.5 text-xs text-slate-500">{shift.scope}</td>
                  <td className="px-5 py-3.5">
                    <button className="p-1 rounded hover:bg-slate-100 text-slate-400"><MoreVertical size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Special Events */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star size={16} className="text-amber-500 fill-amber-400" />
              <h3 className="font-bold text-slate-800">Sự kiện đặc biệt</h3>
            </div>
            <button className="text-amber-500 text-sm font-semibold hover:text-amber-600">+ Thêm</button>
          </div>
          <div className="p-4 space-y-3">
            {specialEvents.map((ev, i) => (
              <div key={i} className="rounded-xl border border-slate-100 p-3.5 hover:border-amber-200 hover:bg-amber-50/40 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">{ev.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{ev.date}</p>
                    <p className="text-xs text-slate-400 mt-0.5">📍 {ev.location}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${ev.tagColor}`}>{ev.tag}</span>
                </div>
              </div>
            ))}
            <button className="w-full py-2 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400 hover:bg-slate-50 transition-colors">
              + Xem lịch sự kiện năm 2024
            </button>
          </div>
        </div>
      </div>

      {/* Bottom summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white">
          <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider">ĐANG CHỜ DUYỆT</p>
          <p className="text-4xl font-extrabold mt-2">14 <span className="text-lg font-semibold">nhân sự</span></p>
          <p className="text-xs text-blue-200 mt-1">⚠ Ưu tiên phê duyệt đăng ký ca đêm</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">TỶ LỆ PHỦ CA THÁNG NÀY</p>
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16">
              <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
                <circle cx="20" cy="20" r="16" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                <circle cx="20" cy="20" r="16" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="85 15" strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-800">85%</span>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-800">85%</p>
              <p className="text-xs text-green-600 font-semibold">+5.2% So với tháng trước</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">LƯU Ý QUẢN LÝ</p>
          <p className="text-sm text-slate-700 font-medium">Kỳ đăng ký Tháng 12 sẽ tự động đóng sau:</p>
          <div className="flex items-center gap-3 mt-3">
            {[["02", "NGÀY"], ["14", "GIỜ"], ["45", "PHÚT"]].map(([val, unit]) => (
              <div key={unit} className="text-center">
                <p className="text-2xl font-extrabold text-slate-900">{val}</p>
                <p className="text-[10px] text-slate-400 font-semibold">{unit}</p>
              </div>
            ))}
          </div>
          <button className="mt-3 text-xs text-amber-600 font-semibold hover:text-amber-700">Gửi thông báo nhắc nhở (Zalo/App) →</button>
        </div>
      </div>
    </div>
  );
}
