"use client";

import React, { useState } from "react";
import {
  Copy,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Info,
} from "lucide-react";

interface ShiftPlan {
  id: string;
  day: string;
  shiftName: string;
  shiftHours: string;
  capacityText: string;
  rateText: string;
  status: "REGISTERED" | "FULL" | "AVAILABLE";
}

const initialShifts: ShiftPlan[] = [
  {
    id: "m1",
    day: "12/10 · Thứ Hai",
    shiftName: "Ca sáng",
    shiftHours: "08:00 – 14:00 · 6 giờ",
    capacityText: "3 / 5",
    rateText: "240.000 VND\n40.000 VND / giờ",
    status: "REGISTERED",
  },
  {
    id: "m2",
    day: "13/10 · Thứ Ba",
    shiftName: "Ca sáng",
    shiftHours: "08:00 – 14:00 · 6 giờ",
    capacityText: "4 / 5",
    rateText: "240.000 VND\n40.000 VND / giờ",
    status: "REGISTERED",
  },
  {
    id: "m3",
    day: "14/10 · Thứ Tư",
    shiftName: "Ca tối",
    shiftHours: "16:00 – 22:00 · 6 giờ",
    capacityText: "5 / 5",
    rateText: "240.000 VND\n40.000 VND / giờ",
    status: "FULL",
  },
  {
    id: "m4",
    day: "15/10 · Thứ Năm",
    shiftName: "Ca tối",
    shiftHours: "16:00 – 22:00 · 6 giờ",
    capacityText: "2 / 5",
    rateText: "240.000 VND\n40.000 VND / giờ",
    status: "AVAILABLE",
  },
  {
    id: "m5",
    day: "16/10 · Thứ Sáu",
    shiftName: "Ca sáng",
    shiftHours: "08:00 – 14:00 · 6 giờ",
    capacityText: "3 / 5",
    rateText: "240.000 VND\n40.000 VND / giờ",
    status: "AVAILABLE",
  },
  {
    id: "m6",
    day: "17/10 · Thứ Bảy",
    shiftName: "Ca sáng",
    shiftHours: "08:00 – 14:00 · 6 giờ",
    capacityText: "2 / 5",
    rateText: "240.000 VND\n40.000 VND / giờ",
    status: "AVAILABLE",
  },
  {
    id: "m7",
    day: "18/10 · Chủ Nhật",
    shiftName: "Ca tối",
    shiftHours: "16:00 – 22:00 · 6 giờ",
    capacityText: "1 / 5",
    rateText: "240.000 VND\n40.000 VND / giờ",
    status: "AVAILABLE",
  },
];

export default function StoreManagerMyShiftPage() {
  const [shifts, setShifts] = useState<ShiftPlan[]>(initialShifts);
  const [search, setSearch] = useState("");

  const handleRegister = (id: string) => {
    setShifts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "REGISTERED" } : s))
    );
  };

  const registeredCount = shifts.filter((s) => s.status === "REGISTERED").length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Đăng ký ca làm việc của tôi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Chọn ca cho chính bạn tại BLOAN Nguyễn Trãi. Không đăng ký thay nhân viên.
          </p>
        </div>
        <button
          onClick={() => alert("Đã sao chép lịch ca giống kỳ trước cho bạn!")}
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
            Dự kiến {(registeredCount * 240000).toLocaleString("vi-VN")} VND · Chờ xác nhận lịch
          </p>
        </div>
      </div>

      {/* Role notice */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-3 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-600 shrink-0" />
        <p>
          Người đang đăng ký: Trần Thu Hà · CH001 · Trưởng cửa hàng. Đơn giá cá nhân: 40.000 VND / giờ. Chỉ áp dụng cho ca của bạn.
        </p>
      </div>

      {/* Shifts Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Ca đang mở đăng ký
          </h3>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm ngày hoặc tên ca"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                <th className="py-3 px-4">Ngày làm</th>
                <th className="py-3 px-4">Ca & giờ</th>
                <th className="py-3 px-4 text-center">Sức chứa</th>
                <th className="py-3 px-4">Tiền công / ca</th>
                <th className="py-3 px-4">Tình trạng</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {shifts.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800">{s.day}</td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-800">{s.shiftName}</p>
                    <p className="text-[11px] text-slate-400">{s.shiftHours}</p>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-700">
                    {s.capacityText}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800 whitespace-pre-line">
                    {s.rateText}
                  </td>
                  <td className="py-3 px-4">
                    {s.status === "REGISTERED" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
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
      </div>
    </div>
  );
}
