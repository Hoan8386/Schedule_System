"use client";

import React, { useState } from "react";
import {
  Copy,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";

interface ShiftItem {
  id: string;
  day: string;
  shiftName: string;
  shiftHours: string;
  store: string;
  registeredCount: number;
  capacity: number;
  ratePerShift: string;
  hoursDetail: string;
  status: "REGISTERED" | "FULL" | "AVAILABLE";
}

const initialShifts: ShiftItem[] = [
  {
    id: "s1",
    day: "12/10 · Thứ Hai",
    shiftName: "Ca sáng",
    shiftHours: "08:00 – 14:00",
    store: "Nguyễn Trãi",
    registeredCount: 3,
    capacity: 5,
    ratePerShift: "180.000 VND",
    hoursDetail: "6 giờ · 30.000 / giờ",
    status: "REGISTERED",
  },
  {
    id: "s2",
    day: "13/10 · Thứ Ba",
    shiftName: "Ca sáng",
    shiftHours: "08:00 – 14:00",
    store: "Nguyễn Trãi",
    registeredCount: 4,
    capacity: 5,
    ratePerShift: "180.000 VND",
    hoursDetail: "6 giờ · 30.000 / giờ",
    status: "REGISTERED",
  },
  {
    id: "s3",
    day: "14/10 · Thứ Tư",
    shiftName: "Ca tối",
    shiftHours: "16:00 – 22:00",
    store: "Nguyễn Trãi",
    registeredCount: 5,
    capacity: 5,
    ratePerShift: "180.000 VND",
    hoursDetail: "6 giờ · 30.000 / giờ",
    status: "FULL",
  },
  {
    id: "s4",
    day: "15/10 · Thứ Năm",
    shiftName: "Ca tối",
    shiftHours: "16:00 – 22:00",
    store: "Nguyễn Trãi",
    registeredCount: 2,
    capacity: 5,
    ratePerShift: "180.000 VND",
    hoursDetail: "6 giờ · 30.000 / giờ",
    status: "AVAILABLE",
  },
  {
    id: "s5",
    day: "16/10 · Thứ Sáu",
    shiftName: "Ca sáng",
    shiftHours: "08:00 – 14:00",
    store: "Cách Mạng Tháng 8",
    registeredCount: 3,
    capacity: 4,
    ratePerShift: "180.000 VND",
    hoursDetail: "6 giờ · 30.000 / giờ",
    status: "AVAILABLE",
  },
  {
    id: "s6",
    day: "17/10 · Thứ Bảy",
    shiftName: "Ca sáng",
    shiftHours: "08:00 – 14:00",
    store: "Nguyễn Trãi",
    registeredCount: 2,
    capacity: 5,
    ratePerShift: "180.000 VND",
    hoursDetail: "6 giờ · 30.000 / giờ",
    status: "AVAILABLE",
  },
  {
    id: "s7",
    day: "18/10 · Chủ Nhật",
    shiftName: "Ca tối",
    shiftHours: "16:00 – 22:00",
    store: "Nguyễn Trãi",
    registeredCount: 1,
    capacity: 5,
    ratePerShift: "180.000 VND",
    hoursDetail: "6 giờ · 30.000 / giờ",
    status: "AVAILABLE",
  },
];

export default function EmployeeRegisterShiftPage() {
  const [shifts, setShifts] = useState<ShiftItem[]>(initialShifts);
  const [search, setSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("all");
  const [shiftFilter, setShiftFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleRegister = (id: string) => {
    setShifts((prev) =>
      prev.map((s) => {
        if (s.id === id && s.status === "AVAILABLE") {
          return {
            ...s,
            registeredCount: s.registeredCount + 1,
            status: "REGISTERED",
          };
        }
        return s;
      })
    );
  };

  const handleCopyPreviousWeek = () => {
    alert("Đã tự động chọn các ca tương ứng theo kỳ trước!");
  };

  const registeredCount = shifts.filter((s) => s.status === "REGISTERED").length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Đăng ký ca
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Chọn ca phù hợp cho tuần tới. Quản lý sẽ xác nhận lịch sau khi kỳ đăng ký kết thúc.
          </p>
        </div>
        <button
          onClick={handleCopyPreviousWeek}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs"
        >
          <Copy className="w-4 h-4 text-slate-500" />
          <span>Thêm giống kỳ trước</span>
        </button>
      </div>

      {/* Top Banner Status */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-extrabold text-slate-800">
              Tuần 12 – 18/10/2026
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              Đang mở
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Đóng đăng ký: 18:00, Thứ Sáu 09/10/2026
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm font-extrabold text-slate-800">
            Bạn đã đăng ký {registeredCount} ca · {registeredCount * 6} giờ
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Dự kiến {(registeredCount * 180000).toLocaleString("vi-VN")} VND · Chờ xác nhận lịch
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm ngày hoặc cửa hàng"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 outline-hidden hover:border-slate-300 focus:border-amber-400 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 outline-hidden hover:border-slate-300"
          >
            <option value="all">Tất cả cửa hàng</option>
            <option value="nt">Nguyễn Trãi</option>
            <option value="cmt8">Cách Mạng Tháng 8</option>
          </select>

          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 outline-hidden hover:border-slate-300"
          >
            <option value="all">Tất cả ca</option>
            <option value="sang">Ca sáng (08:00 - 14:00)</option>
            <option value="toi">Ca tối (16:00 - 22:00)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 outline-hidden hover:border-slate-300"
          >
            <option value="all">Tất cả tình trạng</option>
            <option value="available">Còn chỗ</option>
            <option value="registered">Đã đăng ký</option>
            <option value="full">Hết chỗ</option>
          </select>
        </div>
      </div>

      {/* Shifts Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Ca đang mở đăng ký
          </h3>
          <span className="text-[11px] text-slate-400">
            Số lượng = Đã đăng ký / Sức chứa
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-400">
                <th className="py-3 px-4">Ngày làm</th>
                <th className="py-3 px-4">Ca & giờ</th>
                <th className="py-3 px-4">Cửa hàng</th>
                <th className="py-3 px-4 text-center">Số lượng</th>
                <th className="py-3 px-4">Tiền công / ca</th>
                <th className="py-3 px-4">Tình trạng</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {shifts.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800">
                    {s.day}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-800">{s.shiftName}</p>
                    <p className="text-[11px] text-slate-400">{s.shiftHours}</p>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-600">
                    {s.store}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-700">
                    {s.registeredCount} / {s.capacity}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-800">{s.ratePerShift}</p>
                    <p className="text-[10px] text-slate-400">{s.hoursDetail}</p>
                  </td>
                  <td className="py-3 px-4">
                    {s.status === "REGISTERED" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                        Đã đăng ký
                      </span>
                    )}
                    {s.status === "FULL" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-400">
                        Hết chỗ
                      </span>
                    )}
                    {s.status === "AVAILABLE" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                        Còn chỗ
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {s.status === "REGISTERED" && (
                      <button
                        disabled
                        className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed"
                      >
                        Đã đăng ký
                      </button>
                    )}
                    {s.status === "FULL" && (
                      <button
                        disabled
                        className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-300 text-xs font-semibold cursor-not-allowed"
                      >
                        Hết chỗ
                      </button>
                    )}
                    {s.status === "AVAILABLE" && (
                      <button
                        onClick={() => handleRegister(s.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold transition-all shadow-xs"
                      >
                        Đăng ký ca
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Hiển thị 1–{shifts.length} trong {shifts.length} ca</span>
          <div className="flex items-center gap-1.5">
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-400 disabled:opacity-50">
              Trước
            </button>
            <button className="w-8 h-8 rounded-lg bg-amber-500 text-slate-900 font-bold flex items-center justify-center">
              1
            </button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-400 disabled:opacity-50">
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Notice box */}
      <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-center gap-3 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-600 shrink-0" />
        <p>
          Không thể đăng ký khi ca hết chỗ hoặc trùng giờ với ca đã chọn. Bạn có thể chỉnh sửa đăng ký trước khi kỳ đóng.
        </p>
      </div>
    </div>
  );
}
