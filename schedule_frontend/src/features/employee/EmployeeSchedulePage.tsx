"use client";

import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Filter,
  CheckCircle2,
  CalendarDays,
  ArrowLeftRight,
  CalendarX,
} from "lucide-react";

interface EmployeeSchedulePageProps {
  onOpenRegister: () => void;
  onOpenSwap: () => void;
  onOpenCancel: () => void;
}

const daysOfWeek = [
  { day: "Thứ Hai", date: "05", isToday: true },
  { day: "Thứ Ba", date: "06" },
  { day: "Thứ Tư", date: "07" },
  { day: "Thứ Năm", date: "08" },
  { day: "Thứ Sáu", date: "09" },
  { day: "Thứ Bảy", date: "10" },
  { day: "Chủ Nhật", date: "11" },
];

export default function EmployeeSchedulePage({
  onOpenRegister,
  onOpenSwap,
  onOpenCancel,
}: EmployeeSchedulePageProps) {
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [storeFilter, setStoreFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Lịch làm việc
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi ca của bạn, chủ động sắp xếp thời gian.
          </p>
        </div>
        <button
          onClick={onOpenRegister}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold transition-all shadow-sm shadow-amber-200"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Đăng ký ca</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <select
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 outline-hidden hover:border-slate-300"
          >
            <option value="all">Tất cả cửa hàng</option>
            <option value="nt">BLOAN · Nguyễn Trãi</option>
            <option value="cmt8">BLOAN · Cách Mạng Tháng 8</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 outline-hidden hover:border-slate-300"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="pending">Chờ thay đổi</option>
          </select>
        </div>

        <div className="text-slate-500 font-semibold text-xs">
          5 ca · 30 giờ ·{" "}
          <span className="text-amber-600">Dự kiến 900.000 VND</span>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        {/* Top Controls: Nav + View Mode */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
              <button className="p-2 hover:bg-slate-50 text-slate-600 border-r border-slate-200">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-slate-50 text-slate-600">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <span className="text-sm font-bold text-slate-800">
              05 – 11 tháng 10, 2026
            </span>
            <button className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600">
              Hôm nay
            </button>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === "week"
                  ? "bg-white text-slate-800 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Tuần
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === "month"
                  ? "bg-white text-slate-800 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Tháng
            </button>
          </div>
        </div>

        {/* Schedule Grid Table */}
        <div className="overflow-x-auto mt-4">
          <div className="min-w-[800px]">
            {/* Day Header Row */}
            <div className="grid grid-cols-8 gap-2 pb-3 border-b border-slate-100 text-center">
              <div className="flex items-center justify-center text-slate-400">
                <Clock className="w-4 h-4" />
              </div>
              {daysOfWeek.map((d, i) => (
                <div
                  key={i}
                  className={`py-1 rounded-xl ${
                    d.isToday ? "bg-amber-50/80 font-bold" : ""
                  }`}
                >
                  <p className="text-[11px] text-slate-400">{d.day}</p>
                  <p
                    className={`text-base font-extrabold ${
                      d.isToday ? "text-amber-600" : "text-slate-800"
                    }`}
                  >
                    {d.date}
                  </p>
                </div>
              ))}
            </div>

            {/* Shift Rows */}
            {/* 1. Ca sáng 08:00 */}
            <div className="grid grid-cols-8 gap-2 py-3 border-b border-slate-100 min-h-[90px] items-stretch">
              <div className="text-[11px] text-slate-400 font-medium pt-2 text-center">
                <p>Ca sáng</p>
                <p className="text-[10px] text-slate-300">08:00</p>
              </div>

              {/* Mon 05 */}
              <div />

              {/* Tue 06: Shift */}
              <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">Ca sáng</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    08:00 – 14:00
                  </p>
                  <p className="text-[10px] text-slate-400">Nguyễn Trãi</p>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-slate-200/70 text-slate-700 w-fit mt-1">
                  Đã xác nhận
                </span>
              </div>

              {/* Wed 07 */}
              <div />
              {/* Thu 08 */}
              <div />
              {/* Fri 09 */}
              <div />

              {/* Sat 10: Shift */}
              <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">Ca sáng</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    08:00 – 14:00
                  </p>
                  <p className="text-[10px] text-slate-400">Cách Mạng Tháng 8</p>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-slate-200/70 text-slate-700 w-fit mt-1">
                  Đã xác nhận
                </span>
              </div>

              {/* Sun 11 */}
              <div />
            </div>

            {/* 2. Ca chiều 14:00 */}
            <div className="grid grid-cols-8 gap-2 py-3 border-b border-slate-100 min-h-[60px] items-stretch">
              <div className="text-[11px] text-slate-400 font-medium pt-2 text-center">
                <p>Ca chiều</p>
                <p className="text-[10px] text-slate-300">14:00</p>
              </div>
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
            </div>

            {/* 3. Ca tối 16:00 */}
            <div className="grid grid-cols-8 gap-2 py-3 min-h-[90px] items-stretch">
              <div className="text-[11px] text-slate-400 font-medium pt-2 text-center">
                <p>Ca tối</p>
                <p className="text-[10px] text-slate-300">16:00</p>
              </div>

              {/* Mon 05 (Today) */}
              <div className="p-2.5 bg-amber-50/70 border border-amber-300 rounded-xl flex flex-col justify-between shadow-xs">
                <div>
                  <p className="text-xs font-extrabold text-amber-900">
                    Ca tối
                  </p>
                  <p className="text-[10px] text-amber-800 mt-0.5">
                    16:00 – 22:00
                  </p>
                  <p className="text-[10px] text-amber-700">Nguyễn Trãi</p>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-amber-200/90 text-amber-900 w-fit mt-1">
                  Đã xác nhận
                </span>
              </div>

              {/* Tue 06 */}
              <div />
              {/* Wed 07 */}
              <div />

              {/* Thu 08 */}
              <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">Ca tối</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    16:00 – 22:00
                  </p>
                  <p className="text-[10px] text-slate-400">Nguyễn Trãi</p>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-800 border border-amber-200 w-fit mt-1">
                  Chờ thay đổi
                </span>
              </div>

              {/* Fri 09 */}
              <div />
              {/* Sat 10 */}
              <div />

              {/* Sun 11 */}
              <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">Ca tối</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    16:00 – 22:00
                  </p>
                  <p className="text-[10px] text-slate-400">Nguyễn Trãi</p>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-800 border border-amber-200 w-fit mt-1">
                  Chờ thay đổi
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              Đã xác nhận
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              Chờ thay đổi
            </span>
          </div>
          <span className="text-slate-400 text-[11px]">
            Ca vẫn có hiệu lực cho đến khi yêu cầu được duyệt.
          </span>
        </div>
      </div>

      {/* Bottom Action Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">
              Hôm nay · Ca tối tại BLOAN Nguyễn Trãi
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              16:00 – 22:00 · 6 giờ · 180.000 VND · Quầy bán hàng
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenSwap}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all inline-flex items-center gap-1.5"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-slate-500" />
            <span>Yêu cầu đổi ca</span>
          </button>
          <button
            onClick={onOpenCancel}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all inline-flex items-center gap-1.5"
          >
            <CalendarX className="w-3.5 h-3.5 text-slate-500" />
            <span>Yêu cầu hủy ca</span>
          </button>
        </div>
      </div>
    </div>
  );
}
