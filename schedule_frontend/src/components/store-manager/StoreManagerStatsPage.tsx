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
  Info,
} from "lucide-react";

const staffStats = [
  {
    name: "Nguyễn Minh Anh",
    code: "NV024",
    role: "Nhân viên bán hàng",
    shifts: 4,
    hours: "24 giờ",
    rate: "30.000 VND",
    total: "720.000",
    status: "Chưa đối soát",
  },
  {
    name: "Lê Quốc Bảo",
    code: "NV025",
    role: "Nhân viên bán hàng",
    shifts: 4,
    hours: "24 giờ",
    rate: "30.000 VND",
    total: "720.000",
    status: "Chưa đối soát",
  },
  {
    name: "Phạm Ngọc Linh",
    code: "NV026",
    role: "Nhân viên bán hàng",
    shifts: 4,
    hours: "24 giờ",
    rate: "30.000 VND",
    total: "720.000",
    status: "Chưa đối soát",
  },
  {
    name: "Đặng Gia Huy",
    code: "NV027",
    role: "Nhân viên bán hàng",
    shifts: 4,
    hours: "24 giờ",
    rate: "30.000 VND",
    total: "720.000",
    status: "Chưa đối soát",
  },
  {
    name: "Võ Thanh Thảo",
    code: "NV028",
    role: "Nhân viên bán hàng",
    shifts: 4,
    hours: "24 giờ",
    rate: "30.000 VND",
    total: "720.000",
    status: "Chưa đối soát",
  },
  {
    name: "Trần Minh Phúc",
    code: "NV029",
    role: "Nhân viên bán hàng",
    shifts: 4,
    hours: "24 giờ",
    rate: "30.000 VND",
    total: "720.000",
    status: "Chưa đối soát",
  },
];

const selectedStaffHistory = [
  {
    date: "01/10/2026",
    shift: "Ca sáng · 08:00 – 14:00",
    hours: "6 giờ",
    rate: "30.000 VND",
    total: "180.000",
    status: "Hoàn thành",
  },
  {
    date: "02/10/2026",
    shift: "Ca sáng · 08:00 – 14:00",
    hours: "6 giờ",
    rate: "30.000 VND",
    total: "180.000",
    status: "Hoàn thành",
  },
  {
    date: "03/10/2026",
    shift: "Ca sáng · 08:00 – 14:00",
    hours: "6 giờ",
    rate: "30.000 VND",
    total: "180.000",
    status: "Hoàn thành",
  },
  {
    date: "04/10/2026",
    shift: "Ca sáng · 08:00 – 14:00",
    hours: "6 giờ",
    rate: "30.000 VND",
    total: "180.000",
    status: "Hoàn thành",
  },
];

export default function StoreManagerStatsPage() {
  const [search, setSearch] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("NV024 · Minh Anh");

  const filteredStaff = staffStats.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Thống kê ca làm & tiền
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Giờ làm và tiền công của nhân viên tại BLOAN Nguyễn Trãi · Đơn vị tiền: VND.
          </p>
        </div>
        <button
          onClick={() => alert("Đang xuất danh sách ca làm việc (Excel)...")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Xuất danh sách ca</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <select className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium outline-hidden">
            <option>01/10/2026 – 05/10/2026</option>
            <option>Tháng 09/2026</option>
          </select>
          <select className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium outline-hidden">
            <option>Tất cả nhân viên</option>
            <option>NV024 · Nguyễn Minh Anh</option>
            <option>NV025 · Lê Quốc Bảo</option>
          </select>
        </div>
        <span className="text-slate-400 text-[11px]">
          Cập nhật: 05/10/2026 · 09:00
        </span>
      </div>

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">
              Ca nhân viên hoàn thành
            </span>
            <div className="text-3xl font-black text-slate-800 mt-1">24 ca</div>
            <p className="text-[11px] text-slate-400 mt-1">
              6 nhân viên · Không gồm ca đã hủy
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">
              Tổng giờ làm
            </span>
            <div className="text-3xl font-black text-slate-800 mt-1">144 giờ</div>
            <p className="text-[11px] text-slate-400 mt-1">24 ca × 6 giờ</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">
              Tổng tiền công
            </span>
            <div className="text-3xl font-black text-slate-800 mt-1">
              4.320.000 VND
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              144 giờ × 30.000 VND / giờ
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Staff Stats Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Thống kê nhân viên
          </h3>

          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm tên hoặc mã nhân viên"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                <th className="py-3 px-4">Nhân viên</th>
                <th className="py-3 px-4 text-center">Số ca</th>
                <th className="py-3 px-4">Giờ làm</th>
                <th className="py-3 px-4">Đơn giá / giờ</th>
                <th className="py-3 px-4">Tiền công (VND)</th>
                <th className="py-3 px-4">Đối soát</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStaff.map((s) => (
                <tr key={s.code} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-800">{s.name}</p>
                    <p className="text-[11px] text-slate-400">
                      {s.code} · {s.role}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold">{s.shifts}</td>
                  <td className="py-3.5 px-4">{s.hours}</td>
                  <td className="py-3.5 px-4">{s.rate}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{s.total}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedStaff(`${s.code} · ${s.name}`)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-700"
                    >
                      Lịch sử ca
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <span className="font-bold text-slate-800">
            Tổng · 6 nhân viên: 24 ca · 144 giờ · 4.320.000 VND
          </span>
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

      {/* Staff individual shift detail table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Lịch sử ca · {selectedStaff}
          </h3>

          <select
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-hidden"
          >
            <option>NV024 · Nguyễn Minh Anh</option>
            <option>NV025 · Lê Quốc Bảo</option>
            <option>NV026 · Phạm Ngọc Linh</option>
            <option>NV027 · Đặng Gia Huy</option>
            <option>NV028 · Võ Thanh Thảo</option>
            <option>NV029 · Trần Minh Phúc</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                <th className="py-2.5 px-4">Ngày làm</th>
                <th className="py-2.5 px-4">Ca & giờ</th>
                <th className="py-2.5 px-4">Giờ làm</th>
                <th className="py-2.5 px-4">Đơn giá / giờ</th>
                <th className="py-2.5 px-4">Tiền công (VND)</th>
                <th className="py-2.5 px-4 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {selectedStaffHistory.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800">{row.date}</td>
                  <td className="py-3 px-4">{row.shift}</td>
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
          <span>4 ca · 24 giờ · 720.000 VND · Cửa hàng Nguyễn Trãi</span>
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

      {/* Info Notice Footer */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-3 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-600 shrink-0" />
        <p>
          Tiền công minh họa được tính theo giờ đã ghi nhận; chưa đối soát. Hồ sơ vi phạm không tự động khấu trừ tiền công. Báo cáo chỉ gồm nhân viên cửa hàng Nguyễn Trãi.
        </p>
      </div>
    </div>
  );
}
