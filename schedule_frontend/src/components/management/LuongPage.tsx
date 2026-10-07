"use client";

import React from "react";
import { Download, Plus, Filter, ArrowUpDown, Check, X } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const statCards = [
  { label: "NGÂN SÁCH", badge: "NGÂN SÁCH", badgeColor: "text-blue-600 bg-blue-50", value: "2.450.000.000", unit: "VND", sub: "Tổng quỹ lương", icon: null },
  { label: "THƯỞNG", badge: "THƯỞNG", badgeColor: "text-green-600 bg-green-50", value: "120.000.000", unit: "VND", sub: "Tổng thưởng", icon: null },
  { label: "PHẠT", badge: "PHẠT", badgeColor: "text-red-600 bg-red-50", value: "15.000.000", unit: "VND", sub: "Tổng phạt", icon: null },
];

const salaryData = [
  { name: "Nguyễn Thùy Dương", id: "#NV1002", store: "Chi nhánh Q1", totalShifts: 22, shiftPay: "4.400.000", bonus: "500.000", bonusColor: "text-green-600", penalty: "-", penaltyColor: "text-slate-400", allowance: "200.000", net: "5.100.000", status: "ĐÃ DUYỆT", statusColor: "bg-green-100 text-green-700" },
  { name: "Lê Quốc Khánh", id: "#NV1005", store: "Chi nhánh Q7", totalShifts: 26, shiftPay: "5.200.000", bonus: "1.200.000", bonusColor: "text-green-600", penalty: "-150.000", penaltyColor: "text-red-600", allowance: "350.000", net: "6.600.000", status: "CHỜ DUYỆT", statusColor: "bg-amber-100 text-amber-700" },
  { name: "Hoàng Minh Anh", id: "#NV1009", store: "Chi nhánh BT", totalShifts: 20, shiftPay: "4.000.000", bonus: "300.000", bonusColor: "text-green-600", penalty: "-", penaltyColor: "text-slate-400", allowance: "200.000", net: "4.500.000", status: "ĐÃ DUYỆT", statusColor: "bg-green-100 text-green-700" },
  { name: "Phạm Thành Đạt", id: "#NV1012", store: "Chi nhánh Q3", totalShifts: 18, shiftPay: "3.600.000", bonus: "200.000", bonusColor: "text-green-600", penalty: "-50.000", penaltyColor: "text-red-600", allowance: "200.000", net: "3.950.000", status: "CHỜ DUYỆT", statusColor: "bg-amber-100 text-amber-700" },
  { name: "Trần Mỹ Linh", id: "#NV1101", store: "Chi nhánh Q1", totalShifts: 24, shiftPay: "4.800.000", bonus: "850.000", bonusColor: "text-green-600", penalty: "-", penaltyColor: "text-slate-400", allowance: "400.000", net: "6.050.000", status: "ĐÃ DUYỆT", statusColor: "bg-green-100 text-green-700" },
];

const regionData = [
  { name: "Quận 1", value: 42, color: "#3b82f6" },
  { name: "Quận 7", value: 28, color: "#f59e0b" },
  { name: "Bình Thạnh", value: 15, color: "#10b981" },
  { name: "Các vùng khác", value: 15, color: "#e2e8f0" },
];

const bonusRequests = [
  { name: "Phạm Hoàng Nam", amount: "+1.500k", reason: "Thưởng đạt KPI tháng 11", color: "text-green-600" },
  { name: "Bùi Kim Liên", amount: "+2.000k", reason: "Thưởng nhân viên xuất sắc", color: "text-green-600" },
  { name: "Đỗ Văn Hùng", amount: "+500k", reason: "Thưởng thâm niên (2 năm)", color: "text-green-600" },
];

export default function LuongPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Quản lý lương & Thưởng</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-slate-500">Báo cáo quyết toán lương</p>
            <button className="flex items-center gap-1.5 text-sm font-semibold text-amber-600 border border-amber-200 bg-amber-50 px-2.5 py-0.5 rounded-lg">
              📅 Tháng 11/2023 ▾
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <Download size={15} /> Xuất báo cáo lương
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-white text-sm font-semibold transition-colors shadow-sm">
            <Plus size={15} /> Tạo phiếu thưởng
          </button>
        </div>
      </div>

      {/* Top row: 3 stat cards + pending bonuses card */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500">{card.sub}</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${card.badgeColor}`}>{card.badge}</span>
            </div>
            <p className="text-xl font-extrabold text-slate-900">{card.value}</p>
            <p className="text-xs text-slate-400">{card.unit}</p>
          </div>
        ))}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 text-white">
          <p className="text-xs text-blue-200">Phiếu thưởng chờ duyệt</p>
          <p className="text-5xl font-extrabold mt-1">08</p>
          <p className="text-xs text-blue-200 mt-1">🕐 Cần xử lý trước 17:00 chiều nay</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main salary table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Chi tiết bảng lương nhân sự</h3>
            <div className="flex items-center gap-2">
              <button className="p-1.5 rounded hover:bg-slate-100 text-slate-400"><Filter size={14} /></button>
              <button className="p-1.5 rounded hover:bg-slate-100 text-slate-400"><ArrowUpDown size={14} /></button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Nhân viên</th>
                  <th className="px-4 py-3 text-left">Cửa hàng</th>
                  <th className="px-4 py-3 text-center">Tổng ca</th>
                  <th className="px-4 py-3 text-right">Lương ca</th>
                  <th className="px-4 py-3 text-right">Thưởng</th>
                  <th className="px-4 py-3 text-right">Phạt</th>
                  <th className="px-4 py-3 text-right">Phụ cấp</th>
                  <th className="px-4 py-3 text-right">Thực nhận</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {salaryData.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {row.name.split(" ").slice(-1)[0].slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-xs">{row.name}</p>
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{row.store.split(" ")[0]} {row.store.split(" ")[1]}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-500">{row.id}</td>
                    <td className="px-4 py-4 text-center font-semibold text-slate-800">{row.totalShifts}</td>
                    <td className="px-4 py-4 text-right text-slate-700">{row.shiftPay}</td>
                    <td className={`px-4 py-4 text-right font-semibold ${row.bonusColor}`}>{row.bonus}</td>
                    <td className={`px-4 py-4 text-right font-semibold ${row.penaltyColor}`}>{row.penalty}</td>
                    <td className="px-4 py-4 text-right text-slate-600">{row.allowance}</td>
                    <td className="px-4 py-4 text-right font-bold text-slate-900">{row.net}</td>
                    <td className="px-4 py-4">
                      <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${row.statusColor}`}>{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-400 uppercase font-semibold">Hiển thị 1-10 trên 124 nhân viên</p>
            <div className="flex items-center gap-1">
              {["‹", "1", "2", "3", "›"].map((p, i) => (
                <button key={i} className={`w-7 h-7 rounded text-sm font-medium ${p === "1" ? "bg-amber-400 text-white" : "text-slate-500 hover:bg-slate-100"}`}>{p}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Bonus requests */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Phiếu thưởng mới</h3>
              <button className="text-amber-500 text-xs font-semibold hover:text-amber-600">Xem tất cả</button>
            </div>
            <div className="space-y-3">
              {bonusRequests.map((req, i) => (
                <div key={i} className="pb-3 border-b border-slate-50 last:border-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center">
                        {req.name.split(" ").slice(-1)[0].slice(0, 2).toUpperCase()}
                      </div>
                      <p className="text-sm font-semibold text-slate-800">{req.name}</p>
                    </div>
                    <span className={`text-sm font-bold ${req.color}`}>{req.amount}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 ml-10">{req.reason}</p>
                  <div className="flex gap-2 mt-2 ml-10">
                    <button className="px-3 py-1 rounded-lg bg-green-500 text-white text-xs font-semibold hover:bg-green-600">Duyệt</button>
                    <button className="px-3 py-1 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50">Từ chối</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Salary by region */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-amber-500">📊</span>
              <h3 className="font-bold text-slate-800 text-sm">Tỷ trọng lương theo vùng</h3>
            </div>
            <div className="space-y-2.5">
              {regionData.map((r, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">{r.name}</span>
                  <div className="flex items-center gap-2 w-32">
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                      <div className="h-full rounded-full transition-all" style={{ width: `${r.value}%`, backgroundColor: r.color }} />
                    </div>
                    <span className="text-xs font-bold text-slate-700 w-8 text-right">{r.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tip card */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-amber-500">💡</span>
              <p className="text-sm font-bold text-amber-800">Mẹo quản lý</p>
            </div>
            <p className="text-xs text-amber-700">Bạn có thể thiết lập tự động hóa duyệt thưởng cho nhân viên có điểm chuyên cần đạt 100% trong tháng.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
