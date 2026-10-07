"use client";

import React from "react";
import { Plus, Copy, Pencil, Trash2, MoreVertical, Star, Calendar, Clock, AlertCircle } from "lucide-react";

const registrationPeriods = [
  {
    name: "Đăng ký ca Tháng 11/2026",
    sub: "Áp dụng cho: Toàn hệ thống Ăn Vặt BLOAN",
    dateRange: "20/10/2026 – 30/10/2026",
    status: "ĐANG MỞ",
    statusColor: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    count: "124 ca",
  },
  {
    name: "Đăng ký ca Tháng 10/2026",
    sub: "Áp dụng cho: Toàn hệ thống Ăn Vặt BLOAN",
    dateRange: "20/09/2026 – 30/09/2026",
    status: "ĐÃ ĐÓNG",
    statusColor: "bg-slate-100 text-slate-600 border border-slate-200",
    count: "124 ca",
  },
  {
    name: "Kỳ đăng ký Lễ & Tết Dương Lịch 2027",
    sub: "Áp dụng cho: Toàn bộ khối chi nhánh cửa hàng",
    dateRange: "15/12/2026 – 25/12/2026",
    status: "DỰ THẢO",
    statusColor: "bg-blue-50 text-blue-700 border border-blue-200",
    count: "36 ca",
  },
];

const shifts = [
  { name: "Ca sáng (S1)", time: "08:00 – 12:00", pay: "200.000 đ", scope: "TOÀN HỆ THỐNG" },
  { name: "Ca chiều (C1)", time: "13:00 – 17:00", pay: "200.000 đ", scope: "TOÀN HỆ THỐNG" },
  { name: "Ca tối (T1)", time: "18:00 – 23:00", pay: "260.000 đ", scope: "TOÀN HỆ THỐNG" },
  { name: "Ca gãy (G1)", time: "10:00 – 14:00 / 17:00 – 21:00", pay: "450.000 đ", scope: "CỬA HÀNG ĐÔNG KHÁCH" },
];

const specialEvents = [
  { name: "Lễ Giáng Sinh (Xmas)", date: "24/12 – 25/12/2026", location: "Toàn hệ thống", tag: "x2 Lương", tagColor: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  { name: "Khai trương Store BLOAN 25", date: "10/11/2026", location: "Chi nhánh Quận 7", tag: "+50k/Ca", tagColor: "bg-blue-50 text-blue-700 border border-blue-200" },
  { name: "Tết Dương Lịch 2027", date: "01/01/2027", location: "Toàn hệ thống", tag: "x3 Lương", tagColor: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
];

export default function LichPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Quản lý lịch & Ca làm việc
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Thiết lập các kỳ mở đăng ký ca, định nghĩa ca chuẩn và các sự kiện phụ cấp đặc biệt.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => alert("Đang sao chép thiết lập kỳ đăng ký trước...")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs"
          >
            <Copy className="w-4 h-4 text-slate-500" />
            <span>Nhân bản kỳ trước</span>
          </button>
          <button
            onClick={() => alert("Mở form tạo kỳ đăng ký ca làm mới...")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold transition-all shadow-sm shadow-amber-200"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo kỳ đăng ký mới</span>
          </button>
        </div>
      </div>

      {/* Registration Periods */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Danh sách các kỳ đăng ký ca</h3>
              <p className="text-[11px] text-slate-400">Các đợt nhân viên được phép gửi nguyện vọng làm việc</p>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
            Đang hoạt động: 1 kỳ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3">Tên kỳ đăng ký</th>
                <th className="px-5 py-3">Thời gian mở đăng ký</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3">Số lượng ca</th>
                <th className="px-5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {registrationPeriods.map((period, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-800 text-sm">{period.name}</p>
                    <p className="text-[11px] text-slate-400 font-medium">{period.sub}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 font-medium text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{period.dateRange}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${period.statusColor}`}>
                      {period.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-black text-slate-800 text-sm">{period.count}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => alert(`Sửa kỳ: ${period.name}`)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => alert(`Nhân bản kỳ: ${period.name}`)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-amber-600 transition-colors"
                        title="Nhân bản"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => alert(`Xóa kỳ: ${period.name}`)}
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
      </div>

      {/* Shifts + Special Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Shifts */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Danh mục ca làm việc</h3>
                <p className="text-[11px] text-slate-400">Khung giờ quy chuẩn của hệ thống</p>
              </div>
            </div>
            <button
              onClick={() => alert("Thêm ca làm việc mới...")}
              className="text-amber-600 text-xs font-bold hover:text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl transition-colors"
            >
              + Thêm ca mới
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-5 py-3">Tên ca</th>
                  <th className="px-5 py-3">Khung giờ</th>
                  <th className="px-5 py-3">Thù lao/ca</th>
                  <th className="px-5 py-3">Phạm vi</th>
                  <th className="px-5 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {shifts.map((shift, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-800">{shift.name}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-600">{shift.time}</td>
                    <td className="px-5 py-3.5 font-black text-emerald-600">{shift.pay}</td>
                    <td className="px-5 py-3.5 text-[11px] font-semibold text-slate-500">
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md">{shift.scope}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-700">
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Special Events */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Star className="w-4 h-4 fill-amber-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Sự kiện & Ngày đặc biệt</h3>
                <p className="text-[11px] text-slate-400">Hệ số nhân lương và thưởng ngày lễ</p>
              </div>
            </div>
            <button
              onClick={() => alert("Thêm sự kiện lễ mới...")}
              className="text-amber-600 text-xs font-bold hover:text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl transition-colors"
            >
              + Thêm sự kiện
            </button>
          </div>
          <div className="p-4 space-y-3">
            {specialEvents.map((ev, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200/80 p-3.5 hover:border-amber-300 hover:bg-amber-50/30 transition-all flex items-start justify-between bg-white"
              >
                <div>
                  <p className="font-bold text-slate-800 text-xs sm:text-sm">{ev.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-slate-400" /> {ev.date}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-medium">📍 {ev.location}</p>
                </div>
                <span className={`text-[11px] font-black px-2.5 py-1 rounded-full ${ev.tagColor}`}>
                  {ev.tag}
                </span>
              </div>
            ))}
            <button
              onClick={() => alert("Xem danh mục lịch lễ hội năm 2026-2027...")}
              className="w-full py-2.5 rounded-xl border border-dashed border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-colors"
            >
              + Xem toàn bộ lịch sự kiện năm 2026 – 2027
            </button>
          </div>
        </div>
      </div>

      {/* Bottom summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 text-slate-900 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-amber-950/80">ĐANG CHỜ PHÊ DUYỆT</p>
            <p className="text-3xl sm:text-4xl font-black mt-2 tracking-tight">
              14 <span className="text-base font-bold text-amber-950">nhân sự</span>
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-amber-600/50 flex items-center gap-2 text-xs font-bold text-amber-950">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Ưu tiên phê duyệt các ca đăng ký cuối tuần</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            TỶ LỆ PHỦ CA TOÀN CHUỖI
          </p>
          <div className="flex items-center gap-4 my-2">
            <div className="relative w-16 h-16 shrink-0">
              <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
                <circle cx="20" cy="20" r="16" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="4"
                  strokeDasharray="88 12"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-slate-800">
                88%
              </span>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">88% Phủ ca</p>
              <p className="text-xs text-emerald-600 font-bold mt-0.5">+5.2% so với tháng trước</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Toàn bộ 24 cửa hàng đã đủ nhân sự trực</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">THỜI HẠN KỲ ĐĂNG KÝ</p>
            <p className="text-xs text-slate-600 font-semibold mt-1">Kỳ Tháng 11 sẽ tự động đóng sau:</p>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {[
                ["02", "NGÀY"],
                ["14", "GIỜ"],
                ["45", "PHÚT"],
              ].map(([val, unit]) => (
                <div key={unit} className="text-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xl font-black text-slate-800">{val}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{unit}</p>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => alert("Đã gửi thông báo nhắc nhở đến Zalo & App nhân viên!")}
            className="mt-3 w-full py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-colors text-center"
          >
            Gửi nhắc nhở (Zalo / App) →
          </button>
        </div>
      </div>
    </div>
  );
}
