"use client";

import React from "react";
import { Download, Plus, Filter, ArrowUpDown, Check, X, Calendar, DollarSign, Award, AlertOctagon, Sparkles } from "lucide-react";

const statCards = [
  {
    label: "TỔNG QUỸ LƯƠNG",
    value: "2.450.000.000 đ",
    sub: "Dự toán tháng 10/2026",
    badge: "NGÂN SÁCH",
    badgeColor: "text-blue-700 bg-blue-50 border border-blue-200",
    icon: DollarSign,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
  },
  {
    label: "TỔNG THƯỞNG HIỆU SUẤT",
    value: "120.000.000 đ",
    sub: "+15% đạt mục tiêu doanh thu",
    badge: "THƯỞNG",
    badgeColor: "text-emerald-700 bg-emerald-50 border border-emerald-200",
    icon: Award,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
  },
  {
    label: "TỔNG PHẠT KHẤU TRỪ",
    value: "15.450.000 đ",
    sub: "42 ca vi phạm kỷ luật",
    badge: "PHẠT",
    badgeColor: "text-rose-700 bg-rose-50 border border-rose-200",
    icon: AlertOctagon,
    iconColor: "text-rose-600",
    iconBg: "bg-rose-50",
  },
];

const salaryData = [
  {
    name: "Nguyễn Thùy Dương",
    id: "#NV1002",
    store: "BLOAN · Lê Lợi (Q1)",
    totalShifts: 22,
    shiftPay: "4.400.000 đ",
    bonus: "+500.000 đ",
    bonusColor: "text-emerald-600",
    penalty: "-",
    penaltyColor: "text-slate-400",
    allowance: "200.000 đ",
    net: "5.100.000 đ",
    status: "ĐÃ DUYỆT",
    statusColor: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  {
    name: "Lê Quốc Khánh",
    id: "#NV1005",
    store: "BLOAN · Crescent Mall (Q7)",
    totalShifts: 26,
    shiftPay: "5.200.000 đ",
    bonus: "+1.200.000 đ",
    bonusColor: "text-emerald-600",
    penalty: "-150.000 đ",
    penaltyColor: "text-rose-600",
    allowance: "350.000 đ",
    net: "6.600.000 đ",
    status: "CHỜ DUYỆT",
    statusColor: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  {
    name: "Hoàng Minh Anh",
    id: "#NV1009",
    store: "BLOAN · CMT8 (Tân Bình)",
    totalShifts: 20,
    shiftPay: "4.000.000 đ",
    bonus: "+300.000 đ",
    bonusColor: "text-emerald-600",
    penalty: "-",
    penaltyColor: "text-slate-400",
    allowance: "200.000 đ",
    net: "4.500.000 đ",
    status: "ĐÃ DUYỆT",
    statusColor: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  {
    name: "Phạm Thành Đạt",
    id: "#NV1012",
    store: "BLOAN · Tú Xương (Q3)",
    totalShifts: 18,
    shiftPay: "3.600.000 đ",
    bonus: "+200.000 đ",
    bonusColor: "text-emerald-600",
    penalty: "-50.000 đ",
    penaltyColor: "text-rose-600",
    allowance: "200.000 đ",
    net: "3.950.000 đ",
    status: "CHỜ DUYỆT",
    statusColor: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  {
    name: "Trần Mỹ Linh",
    id: "#NV1101",
    store: "BLOAN · Lê Lợi (Q1)",
    totalShifts: 24,
    shiftPay: "4.800.000 đ",
    bonus: "+850.000 đ",
    bonusColor: "text-emerald-600",
    penalty: "-",
    penaltyColor: "text-slate-400",
    allowance: "400.000 đ",
    net: "6.050.000 đ",
    status: "ĐÃ DUYỆT",
    statusColor: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
];

const regionData = [
  { name: "Cụm Quận 1 & Trung Tâm", value: 42, color: "#f59e0b" },
  { name: "Cụm Quận 7 & Nam Sài Gòn", value: 28, color: "#3b82f6" },
  { name: "Cụm Bình Thạnh & Thủ Đức", value: 18, color: "#10b981" },
  { name: "Cụm Tân Bình & Gò Vấp", value: 12, color: "#94a3b8" },
];

const bonusRequests = [
  { name: "Phạm Hoàng Nam", amount: "+1.500.000 đ", reason: "Đạt Top 1 Doanh số Quầy Bar", color: "text-emerald-600" },
  { name: "Bùi Kim Liên", amount: "+2.000.000 đ", reason: "Nhân viên xuất sắc toàn chuỗi tháng 10", color: "text-emerald-600" },
  { name: "Đỗ Văn Hùng", amount: "+500.000 đ", reason: "Thưởng thâm niên gắn bó 2 năm", color: "text-emerald-600" },
];

export default function LuongPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Quản lý lương & Thưởng chuỗi
            </h1>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>Tháng 10/2026 ▾</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Bảng quyết toán thu nhập, thưởng KPI, phụ cấp và các khoản trích trừ của toàn hệ thống Ăn Vặt BLOAN.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => alert("Đang xuất bảng quyết toán lương ra file Excel...")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Xuất bảng lương</span>
          </button>
          <button
            onClick={() => alert("Mở form đề xuất phiếu thưởng mới...")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold transition-all shadow-sm shadow-amber-200"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo phiếu thưởng</span>
          </button>
        </div>
      </div>

      {/* Top Cards: 3 Stat cards + 1 Action Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between"
            >
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${card.badgeColor}`}>
                  {card.badge}
                </span>
                <div className="text-xl sm:text-2xl font-black text-slate-800 mt-2 tracking-tight">
                  {card.value}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-semibold">{card.sub}</p>
              </div>
              <div
                className={`w-10 h-10 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center shrink-0`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 text-slate-900 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-600/40 text-amber-950 px-2 py-0.5 rounded-md">
              CẦN XỬ LÝ
            </span>
            <div className="text-4xl font-black mt-2 tracking-tight">08</div>
            <p className="text-xs font-bold text-amber-950 mt-1">Phiếu thưởng đang chờ duyệt</p>
          </div>
          <p className="text-[11px] font-semibold text-amber-950/80 pt-2 border-t border-amber-600/40">
            ⏰ Hạn chốt trước 17:00 chiều nay
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Salary Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Chi tiết bảng lương nhân sự</h3>
                <p className="text-[11px] text-slate-400">Dữ liệu tính theo số ca thực tế đã chấm công</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500">
                  <Filter className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500">
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/60 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-4 py-3">Nhân viên</th>
                    <th className="px-4 py-3 text-center">Tổng ca</th>
                    <th className="px-4 py-3 text-right">Lương ca</th>
                    <th className="px-4 py-3 text-right">Thưởng</th>
                    <th className="px-4 py-3 text-right">Phạt</th>
                    <th className="px-4 py-3 text-right">Phụ cấp</th>
                    <th className="px-4 py-3 text-right">Thực nhận</th>
                    <th className="px-4 py-3 text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {salaryData.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center border border-amber-200 shrink-0">
                            {row.name.split(" ").slice(-1)[0].slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-xs">{row.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{row.store}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center font-bold text-slate-800">{row.totalShifts}</td>
                      <td className="px-4 py-4 text-right font-medium text-slate-700">{row.shiftPay}</td>
                      <td className={`px-4 py-4 text-right font-bold ${row.bonusColor}`}>{row.bonus}</td>
                      <td className={`px-4 py-4 text-right font-bold ${row.penaltyColor}`}>{row.penalty}</td>
                      <td className="px-4 py-4 text-right text-slate-600 font-medium">{row.allowance}</td>
                      <td className="px-4 py-4 text-right font-black text-slate-900 text-sm">{row.net}</td>
                      <td className="px-4 py-4 text-right">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${row.statusColor}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="px-5 py-3.5 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <p>
              Hiển thị <span className="font-bold text-slate-700">1 – 5</span> trên{" "}
              <span className="font-bold text-slate-700">124</span> nhân sự tháng này
            </p>
            <div className="flex items-center gap-1.5">
              {["‹", "1", "2", "3", "›"].map((p, i) => (
                <button
                  key={i}
                  className={`w-7 h-7 rounded-lg font-bold transition-colors ${
                    p === "1"
                      ? "bg-amber-500 text-slate-900 shadow-2xs"
                      : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar (1 col) */}
        <div className="space-y-4">
          {/* Bonus Requests */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Phiếu thưởng đề xuất</h3>
              </div>
              <button
                onClick={() => alert("Xem toàn bộ danh sách phiếu thưởng...")}
                className="text-amber-700 text-xs font-bold hover:underline"
              >
                Xem tất cả
              </button>
            </div>
            <div className="space-y-3">
              {bonusRequests.map((req, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50/60 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-800">{req.name}</p>
                    <span className={`text-xs font-black ${req.color}`}>{req.amount}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{req.reason}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => alert(`Đã duyệt thưởng cho ${req.name}`)}
                      className="flex-1 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold transition-colors shadow-2xs text-center"
                    >
                      Duyệt
                    </button>
                    <button
                      onClick={() => alert(`Từ chối phiếu thưởng của ${req.name}`)}
                      className="flex-1 py-1 rounded-lg border border-slate-200 hover:bg-white text-slate-600 text-xs font-semibold transition-colors text-center"
                    >
                      Từ chối
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Region Progress */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <DollarSign className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Tỷ trọng chi lương theo cụm</h3>
            </div>
            <div className="space-y-3">
              {regionData.map((r, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">{r.name}</span>
                    <span className="font-black text-slate-800">{r.value}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${r.value}%`, backgroundColor: r.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tip Card */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <p className="text-xs font-black text-amber-900 uppercase tracking-wider">Mẹo quản lý lương</p>
            </div>
            <p className="text-xs text-amber-900/90 leading-relaxed font-medium">
              Bạn có thể kích hoạt tính năng tự động duyệt thưởng chuyên cần 500k cho nhân sự không có bất kỳ ca đi muộn nào trong tháng.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
