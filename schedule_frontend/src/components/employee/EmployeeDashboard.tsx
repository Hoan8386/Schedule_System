"use client";

import React from "react";
import {
  Calendar,
  Clock,
  Wallet,
  Inbox,
  ArrowRight,
  Bell,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";

interface EmployeeDashboardProps {
  onGoToSchedule: () => void;
  onOpenSwap: () => void;
  onOpenCancel: () => void;
}

export default function EmployeeDashboard({
  onGoToSchedule,
  onOpenSwap,
  onOpenCancel,
}: EmployeeDashboardProps) {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Chào buổi sáng, Minh Anh
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Một ngày mới, một ca làm suôn sẻ. Đây là tổng quan công việc của bạn.
          </p>
        </div>
        <button
          onClick={onGoToSchedule}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs"
        >
          <Calendar className="w-4 h-4 text-slate-500" />
          <span>Xem lịch làm việc</span>
        </button>
      </div>

      {/* Date subtitle filter note */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="font-semibold text-slate-600">
          Tháng 10/2026 · Lũy kế từ 01/10 đến 05/10
        </span>
        <span>Chỉ tính ca đã hoàn thành</span>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">
              Ca đã hoàn thành
            </span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-800 tracking-tight">
              4 ca
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">
              01 – 04/10/2026
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">
              Tổng giờ làm
            </span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-800 tracking-tight">
              24 giờ
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">
              6 giờ / ca
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">
              Tổng tiền công
            </span>
            <Wallet className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-800 tracking-tight">
              720.000 VND
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">
              30.000 VND / giờ · Trước khấu trừ
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">
              Yêu cầu đang xử lý
            </span>
            <Inbox className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-800 tracking-tight">
              2 yêu cầu
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">
              1 đổi ca · 1 hủy ca
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Upcoming shift & Pending requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ca làm sắp tới */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-amber-500 rounded-full" />
                <h3 className="text-sm font-bold text-slate-800">
                  Ca làm sắp tới
                </h3>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                Đã xác nhận
              </span>
            </div>

            <div className="flex items-start gap-4 p-3 bg-amber-50/50 rounded-xl border border-amber-100/80">
              <div className="w-14 h-16 bg-white rounded-xl border border-amber-200 flex flex-col items-center justify-center shrink-0 shadow-xs">
                <span className="text-[9px] font-bold text-amber-600 uppercase">
                  Thứ Hai
                </span>
                <span className="text-xl font-black text-slate-800">05</span>
                <span className="text-[9px] text-slate-400">Tháng 10</span>
              </div>
              <div className="space-y-1">
                <div className="text-base font-bold text-slate-800">
                  Ca tối · 16:00 – 22:00
                </div>
                <div className="text-xs text-slate-600">
                  BLOAN Nguyễn Trãi · Quầy bán hàng
                </div>
                <div className="text-xs font-semibold text-amber-700">
                  6 giờ · 180.000 VND
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs">
            <span className="text-slate-400 text-[11px]">
              Vui lòng có mặt trước giờ bắt đầu 10 phút.
            </span>
            <button
              onClick={onGoToSchedule}
              className="inline-flex items-center gap-1.5 font-bold text-slate-700 hover:text-amber-600 transition-colors"
            >
              <span>Chi tiết ca</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Yêu cầu đang xử lý */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800">
                Yêu cầu đang xử lý
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200/60">
                2 yêu cầu
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50/70 transition-all">
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Đổi ca · 08/10
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Ca tối → Ca sáng 09/10
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    DC-024 · Gửi ngày 04/10
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200/80">
                  Chờ duyệt
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50/70 transition-all">
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Hủy ca · 11/10
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Ca tối · Nguyễn Trãi
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    HC-018 · Gửi ngày 04/10
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200/80">
                  Chờ duyệt
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-end gap-3 text-xs">
            <button
              onClick={onOpenSwap}
              className="text-amber-600 font-semibold hover:underline"
            >
              + Đổi ca khác
            </button>
            <button
              onClick={onOpenCancel}
              className="text-slate-500 font-semibold hover:underline"
            >
              + Báo hủy ca
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Lịch tuần này & Thông báo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lịch tuần này (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">
              Lịch của bạn tuần này
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              5 ca · 30 giờ
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400">
                  <th className="pb-2.5 font-semibold">Ngày</th>
                  <th className="pb-2.5 font-semibold">Ca làm</th>
                  <th className="pb-2.5 font-semibold">Cửa hàng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 font-semibold text-slate-800">
                    06/10 · Thứ Ba
                  </td>
                  <td className="py-3">Ca sáng · 08:00 – 14:00</td>
                  <td className="py-3 text-slate-500">Nguyễn Trãi</td>
                </tr>
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 font-semibold text-slate-800">
                    08/10 · Thứ Năm
                  </td>
                  <td className="py-3">Ca tối · 16:00 – 22:00</td>
                  <td className="py-3 text-slate-500">Nguyễn Trãi</td>
                </tr>
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 font-semibold text-slate-800">
                    10/10 · Thứ Bảy
                  </td>
                  <td className="py-3">Ca sáng · 08:00 – 14:00</td>
                  <td className="py-3 text-slate-500">Cách Mạng Tháng 8</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Thông báo (1 col) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">Thông báo</h3>
            <span className="text-xs text-amber-600 font-bold">3 mới</span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-slate-800">Đăng ký ca tuần tới đã mở</p>
                <p className="text-[11px] text-slate-500">
                  Kỳ 12 – 18/10 đóng lúc 18:00 ngày 09/10.
                </p>
                <p className="text-[10px] text-slate-400">Hôm nay · 08:00</p>
              </div>
            </div>

            <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-slate-800">
                  Hoàn thành bài kiểm tra an toàn
                </p>
                <p className="text-[11px] text-slate-500">
                  Vui lòng nộp bài trước 23:59 ngày 07/10.
                </p>
                <p className="text-[10px] text-slate-400">Hôm nay · 07:30</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-slate-800">
                  Lịch tuần này đã được xác nhận
                </p>
                <p className="text-[11px] text-slate-500">
                  Kiểm tra cửa hàng và giờ làm trước mỗi ca.
                </p>
                <p className="text-[10px] text-slate-400">04/10 · 18:00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
