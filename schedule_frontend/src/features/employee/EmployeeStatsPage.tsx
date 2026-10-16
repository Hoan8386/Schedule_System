"use client";

import React, { useState } from "react";
import {
  Download,
  Calendar,
  Clock,
  Wallet,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const dailyHours = [
  { day: "01/10", hours: 6 },
  { day: "02/10", hours: 6 },
  { day: "03/10", hours: 6 },
  { day: "04/10", hours: 6 },
  { day: "05/10", hours: 0 },
];

const completedShifts = [
  {
    date: "01/10/2026",
    shift: "Ca sáng · 08:00 – 14:00",
    store: "Nguyễn Trãi",
    hours: "6 giờ",
    rate: "30.000 VND",
    total: "180.000 VND",
    status: "Hoàn thành",
  },
  {
    date: "02/10/2026",
    shift: "Ca sáng · 08:00 – 14:00",
    store: "Nguyễn Trãi",
    hours: "6 giờ",
    rate: "30.000 VND",
    total: "180.000 VND",
    status: "Hoàn thành",
  },
  {
    date: "03/10/2026",
    shift: "Ca sáng · 08:00 – 14:00",
    store: "Nguyễn Trãi",
    hours: "6 giờ",
    rate: "30.000 VND",
    total: "180.000 VND",
    status: "Hoàn thành",
  },
  {
    date: "04/10/2026",
    shift: "Ca sáng · 08:00 – 14:00",
    store: "Nguyễn Trãi",
    hours: "6 giờ",
    rate: "30.000 VND",
    total: "180.000 VND",
    status: "Hoàn thành",
  },
];

export default function EmployeeStatsPage() {
  const [search, setSearch] = useState("");

  const handleExport = () => {
    alert("Đang chuẩn bị file PDF sao kê giờ làm và tiền công của bạn...");
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Thống kê ca làm & tiền
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Giờ làm và tiền công thực tế từ các ca đã hoàn thành.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Xuất báo cáo</span>
        </button>
      </div>

      {/* Date & Store Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <select className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 outline-hidden hover:border-slate-300">
            <option>01/10/2026 – 05/10/2026</option>
            <option>Tháng 09/2026</option>
          </select>
          <select className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 outline-hidden hover:border-slate-300">
            <option>Tất cả cửa hàng</option>
            <option>BLOAN · Nguyễn Trãi</option>
            <option>BLOAN · Cách Mạng Tháng 8</option>
          </select>
        </div>
        <span className="text-slate-400 text-[11px]">
          Cập nhật: 05/10/2026 · 09:00
        </span>
      </div>

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">
              Số ca hoàn thành
            </span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-800 tracking-tight">
              4 ca
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">
              Không gồm ca sắp tới hoặc đã hủy
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">
              Tổng giờ làm
            </span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-800 tracking-tight">
              24 giờ
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">
              4 ca × 6 giờ
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">
              Tổng tiền công
            </span>
            <Wallet className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-800 tracking-tight">
              720.000 VND
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">
              24 giờ × 30.000 VND · Trước khấu trừ
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Bar Chart & Payroll breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">Giờ làm theo ngày</h3>
            <span className="text-xs text-slate-400">Đơn vị: giờ</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyHours} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} />
                <YAxis
                  domain={[0, 8]}
                  ticks={[0, 3, 6]}
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  tickLine={false}
                  unit=" giờ"
                />
                <Tooltip
                  formatter={(val: any) => [`${val} giờ`, "Giờ làm"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }}
                />
                <Bar dataKey="hours" fill="#F59E0B" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-4">
              Thông tin tiền công
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Đã ghi nhận</span>
                <span className="font-bold text-slate-800">720.000 VND</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Đã thanh toán</span>
                <span className="font-bold text-slate-800">0 VND</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-slate-700 font-bold">Chưa thanh toán</span>
                <span className="text-lg font-black text-amber-600">
                  720.000 VND
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-4 leading-relaxed pt-3 border-t border-slate-100">
            Tiền công tháng 10 được đối soát cuối tháng. Chưa bao gồm thưởng hoặc khấu trừ.
          </p>
        </div>
      </div>

      {/* Completed shifts history table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Lịch sử ca đã hoàn thành
          </h3>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm ngày hoặc ca"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden hover:border-slate-300 focus:border-amber-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-400">
                <th className="py-3 px-4">Ngày</th>
                <th className="py-3 px-4">Ca & giờ</th>
                <th className="py-3 px-4">Cửa hàng</th>
                <th className="py-3 px-4">Giờ làm</th>
                <th className="py-3 px-4">Đơn giá / giờ</th>
                <th className="py-3 px-4">Tiền công</th>
                <th className="py-3 px-4 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {completedShifts.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800">
                    {row.date}
                  </td>
                  <td className="py-3 px-4 font-medium">{row.shift}</td>
                  <td className="py-3 px-4 text-slate-600">{row.store}</td>
                  <td className="py-3 px-4">{row.hours}</td>
                  <td className="py-3 px-4">{row.rate}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{row.total}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Hiển thị 1–4 trong 4 ca · Tổng 24 giờ · 720.000 VND</span>
          <div className="flex items-center gap-1.5">
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-400">
              Trước
            </button>
            <button className="w-8 h-8 rounded-lg bg-amber-500 text-slate-900 font-bold flex items-center justify-center">
              1
            </button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-400">
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
