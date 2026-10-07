"use client";

import React, { useState } from "react";
import {
  Clock,
  AlertCircle,
  UserX,
  Timer,
  Search,
  Download,
  Upload,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";

const statCards = [
  {
    label: "Tổng số ca hôm nay",
    value: "450 ca",
    sub: "+12% so với hôm qua",
    icon: Clock,
  },
  {
    label: "Đi muộn / Về sớm",
    value: "28 ca",
    sub: "Cần quản lý xác minh",
    icon: AlertCircle,
  },
  {
    label: "Nghỉ không phép",
    value: "5 ca",
    sub: "Đã chuyển HR xử lý",
    icon: UserX,
  },
  {
    label: "Chờ điều chỉnh",
    value: "12 yêu cầu",
    sub: "Yêu cầu bù giờ từ NV",
    icon: Timer,
  },
];

const attendanceData = [
  {
    name: "Lê Thị Mai",
    id: "NV-8821",
    store: "BLOAN · Nguyễn Trãi",
    date: "05/10/2026",
    shift: "08:00 – 14:00",
    checkIn: "07:55",
    checkOut: "14:05",
    diff: "-5m",
    status: "HỢP LỆ",
  },
  {
    name: "Trần Văn Nam",
    id: "NV-3392",
    store: "BLOAN · Cách Mạng Tháng 8",
    date: "05/10/2026",
    shift: "08:00 – 14:00",
    checkIn: "08:15",
    checkOut: "14:02",
    diff: "+15m",
    status: "VI PHẠM",
  },
  {
    name: "Phạm Thu Thảo",
    id: "NV-1044",
    store: "BLOAN · Lê Lợi",
    date: "05/10/2026",
    shift: "16:00 – 22:00",
    checkIn: "15:50",
    checkOut: "--:--",
    diff: "Đang làm",
    status: "CHỜ CHECK-OUT",
  },
  {
    name: "Nguyễn Duy Mạnh",
    id: "NV-2256",
    store: "BLOAN · Quang Trung",
    date: "05/10/2026",
    shift: "08:00 – 14:00",
    checkIn: "07:58",
    checkOut: "14:01",
    diff: "-2m",
    status: "HỢP LỆ",
  },
  {
    name: "Hoàng Anh Thư",
    id: "NV-5501",
    store: "BLOAN · Tú Xương",
    date: "05/10/2026",
    shift: "08:00 – 14:00",
    checkIn: "08:45",
    checkOut: "13:30",
    diff: "+75m",
    status: "VI PHẠM",
  },
];

export default function ChamCongPage() {
  const [search, setSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Quản lý chấm công
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi check-in/check-out, đối soát giờ làm và phát hiện sai lệch toàn chuỗi.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => alert("Đang xuất bảng chấm công ra file Excel...")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Xuất Excel</span>
          </button>
          <button
            onClick={() => alert("Mở trình nhập dữ liệu máy chấm công vân tay / FaceID...")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold transition-all shadow-sm shadow-amber-200"
          >
            <Upload className="w-4 h-4" />
            <span>Import dữ liệu</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
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
                <p className="text-[11px] text-slate-400 mt-1 font-medium">
                  {card.sub}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
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
              placeholder="Tìm tên nhân viên, Mã NV..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl outline-hidden hover:border-slate-300 focus:border-amber-400 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={storeFilter}
              onChange={(e) => setStoreFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 outline-hidden hover:border-slate-300"
            >
              <option value="all">Tất cả cửa hàng (24)</option>
              <option value="nt">BLOAN · Nguyễn Trãi</option>
              <option value="cmt8">BLOAN · Cách Mạng Tháng 8</option>
              <option value="ll">BLOAN · Lê Lợi</option>
            </select>

            <select className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 outline-hidden hover:border-slate-300">
              <option>Hôm nay (05/10/2026)</option>
              <option>Hôm qua</option>
              <option>Tuần này</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 outline-hidden hover:border-slate-300"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="valid">Hợp lệ</option>
              <option value="violation">Vi phạm</option>
              <option value="waiting">Chờ check-out</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                <th className="py-3 px-4">Nhân viên</th>
                <th className="py-3 px-4">Cửa hàng</th>
                <th className="py-3 px-4">Ngày</th>
                <th className="py-3 px-4">Ca làm việc</th>
                <th className="py-3 px-4">Check-in</th>
                <th className="py-3 px-4">Check-out</th>
                <th className="py-3 px-4">Chênh lệch</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {attendanceData.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0">
                        {row.name.split(" ").slice(-1)[0].slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{row.name}</p>
                        <p className="text-[10px] text-slate-400">{row.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-600">{row.store}</td>
                  <td className="py-3.5 px-4 text-slate-500">{row.date}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">{row.shift}</td>
                  <td
                    className={`py-3.5 px-4 font-bold ${
                      row.checkIn > "08:00" ? "text-amber-600" : "text-slate-800"
                    }`}
                  >
                    {row.checkIn}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{row.checkOut}</td>
                  <td
                    className={`py-3.5 px-4 font-bold ${
                      row.diff.startsWith("+")
                        ? "text-red-500"
                        : row.diff === "Đang làm"
                        ? "text-blue-500"
                        : "text-slate-500"
                    }`}
                  >
                    {row.diff}
                  </td>
                  <td className="py-3.5 px-4">
                    {row.status === "HỢP LỆ" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Hợp lệ
                      </span>
                    )}
                    {row.status === "VI PHẠM" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200">
                        Vi phạm
                      </span>
                    )}
                    {row.status === "CHỜ CHECK-OUT" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                        Chờ check-out
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => alert(`Xem chi tiết bản ghi chấm công ${row.id}`)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-700"
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Hiển thị 1–5 trong số <strong>450</strong> bản ghi chấm công hôm nay
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

      {/* Info notice */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-3 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-600 shrink-0" />
        <p>
          Dữ liệu chấm công được đồng bộ tức thời từ ứng dụng nhân viên và thiết bị tại cửa hàng. Mọi hiệu chỉnh đều được lưu vết phục vụ đối soát bảng lương.
        </p>
      </div>
    </div>
  );
}
