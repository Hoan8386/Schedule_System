"use client";

import React from "react";
import { Download, Filter } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const top5Data = [
  { name: "Quốc Khánh", pct: 88 },
  { name: "Minh Anh", pct: 89 },
  { name: "Hoàng Nam", pct: 92 },
  { name: "Văn Hùng", pct: 95 },
  { name: "Thùy Dương", pct: 98 },
];

const violationByStore = [
  { name: "Quận 1", value: 35, color: "#ef4444" },
  { name: "Quận 7", value: 25, color: "#f59e0b" },
  { name: "Quận 3", value: 20, color: "#3b82f6" },
  { name: "Bình Thạnh", value: 15, color: "#10b981" },
  { name: "Kho", value: 5, color: "#94a3b8" },
];

const performanceData = [
  { name: "Nguyễn Thùy Dương", store: "Chi nhánh Q1", role: "Bán hàng", shifts: 24, hours: "192h", stars: 5, violations: 0, bonus: "+1.200k", penalty: "0", rate: 98.2 },
  { name: "Đỗ Văn Hùng", store: "Chi nhánh Q3", role: "Bán hàng", shifts: 22, hours: "176h", stars: 4, violations: 1, bonus: "+850k", penalty: "-50k", rate: 95.4 },
  { name: "Lê Quốc Khánh", store: "Chi nhánh Q7", role: "Kho vận", shifts: 20, hours: "160h", stars: 3, violations: 3, bonus: "+200k", penalty: "-350k", rate: 82.1 },
];

const exportCards = [
  { title: "Danh sách ca làm", desc: "Chi tiết giờ vào/ra, tăng ca và nghỉ phép theo từng nhân sự.", formats: ["XLSX", "CSV"], icon: "📊", color: "text-green-600" },
  { title: "Bảng lương tổng hợp", desc: "Báo cáo lương cứng, thưởng hiệu suất, phụ cấp và các khoản khấu trừ.", formats: ["PDF", "XLSX"], icon: "📋", color: "text-blue-600" },
  { title: "Báo cáo vi phạm", desc: "Thống kê lỗi nội quy, biên bản vi phạm và tình trạng xử lý khiếu nại.", formats: ["PDF", "DOCX"], icon: "⚠", color: "text-red-600" },
];

export default function ThongKePage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <nav className="text-xs text-slate-400 mb-1">Hệ thống <span className="mx-1">›</span> <span className="text-slate-600">Báo cáo hiệu suất</span></nav>
          <h1 className="text-2xl font-extrabold text-slate-900">Thống kê & Báo cáo</h1>
          <p className="text-sm text-slate-500 mt-1">Phân tích hiệu suất làm việc và xuất báo cáo tổng hợp</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition-colors shadow-sm">
          <Download size={15} /> Xuất dữ liệu tổng hợp
        </button>
      </div>

      {/* Status bar + filters */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs text-slate-500 font-medium mb-1 block">CỬA HÀNG</label>
          <select className="text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-300 min-w-[160px]">
            <option>Tất cả chi nhánh</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 font-medium mb-1 block">PHÒNG BAN</label>
          <select className="text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-300 min-w-[160px]">
            <option>Tất cả phòng ban</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 font-medium mb-1 block">THỜI GIAN</label>
          <div className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 min-w-[160px]">
            <span className="text-slate-400">📅</span>
            <span>Tháng 11, 2023</span>
          </div>
        </div>
        <input placeholder="Tìm tên nhân viên..." className="text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white w-44 focus:outline-none focus:ring-2 focus:ring-amber-300 placeholder:text-slate-400" />
        <button className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500"><Filter size={16} /></button>
        <button className="px-4 py-2 rounded-lg bg-amber-400 text-white text-sm font-semibold hover:bg-amber-500">Lọc kết quả</button>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-slate-800">Top 5 Nhân viên xuất sắc</h3>
            <button className="text-amber-500 text-xs font-semibold hover:text-amber-600">Chi tiết</button>
          </div>
          <p className="text-xs text-slate-400 mb-4">Dựa trên điểm thành tích và hiệu suất</p>
          <div className="space-y-2.5">
            {top5Data.map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 text-right w-20 shrink-0">{d.name}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden relative">
                  <div
                    className="h-full rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${d.pct}%`, background: `linear-gradient(90deg, #fbbf24, #f59e0b)` }}
                  >
                    <span className="text-[10px] text-white font-bold">{d.pct}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-slate-800">Vi phạm theo Cửa hàng</h3>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">+12%</span>
          </div>
          <p className="text-xs text-slate-400 mb-2">Số ca vi phạm nội quy ghi nhận trong tháng</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={violationByStore} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name} ${value}%`} labelLine={false}>
                {violationByStore.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Bảng đánh giá hiệu suất nhân sự</h3>
          <span className="text-xs text-slate-400">Sắp xếp: Hiệu suất cao nhất</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3 text-left">Nhân viên</th>
                <th className="px-5 py-3 text-left">Cửa hàng</th>
                <th className="px-5 py-3 text-center">Tổng ca</th>
                <th className="px-5 py-3 text-center">Tổng giờ</th>
                <th className="px-5 py-3 text-center">Điểm</th>
                <th className="px-5 py-3 text-center">Vi phạm</th>
                <th className="px-5 py-3 text-right">Thưởng</th>
                <th className="px-5 py-3 text-right">Phạt</th>
                <th className="px-5 py-3 text-right">Hiệu suất</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {performanceData.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center border border-amber-200 shrink-0">
                        {row.name.split(" ").slice(-1)[0].slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{row.name}</p>
                        <p className="text-[11px] text-slate-400">{row.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600 text-xs">{row.store}</td>
                  <td className="px-5 py-4 text-center font-semibold text-slate-800">{row.shifts}</td>
                  <td className="px-5 py-4 text-center text-slate-600">{row.hours}</td>
                  <td className="px-5 py-4 text-center">
                    <span className="text-amber-400">{"★".repeat(row.stars)}{"☆".repeat(5 - row.stars)}</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${row.violations === 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {row.violations}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-semibold text-green-600">{row.bonus}</td>
                  <td className="px-5 py-4 text-right font-semibold text-red-600">{row.penalty}</td>
                  <td className="px-5 py-4 text-right">
                    <div>
                      <p className="font-extrabold text-slate-900">{row.rate}%</p>
                      <div className="w-full bg-slate-100 rounded-full h-1 mt-1">
                        <div className="h-full rounded-full bg-amber-400" style={{ width: `${row.rate}%` }} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export cards */}
      <div>
        <h3 className="font-bold text-slate-800 mb-4">Lựa chọn xuất dữ liệu</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {exportCards.map((card, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-100 shadow-xs p-5 hover:border-amber-200 transition-colors group">
              <div className="flex items-start justify-between">
                <span className={`text-2xl`}>{card.icon}</span>
                <button className="p-1.5 rounded hover:bg-slate-100 text-slate-400"><Download size={14} /></button>
              </div>
              <h4 className="font-semibold text-slate-800 mt-3">{card.title}</h4>
              <p className="text-xs text-slate-500 mt-1">{card.desc}</p>
              <div className="flex items-center gap-1.5 mt-3">
                {card.formats.map((fmt, j) => (
                  <span key={j} className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">{fmt}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
