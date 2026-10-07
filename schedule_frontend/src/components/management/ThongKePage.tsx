"use client";

import React, { useState } from "react";
import { Download, Filter, Search, Award, TrendingUp, Calendar, FileSpreadsheet, FileText, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const top5Data = [
  { name: "Nguyễn Thùy Dương", pct: 98, role: "BLOAN · Lê Lợi" },
  { name: "Đỗ Văn Hùng", pct: 95, role: "BLOAN · Tú Xương" },
  { name: "Phạm Hoàng Nam", pct: 92, role: "BLOAN · Giga Mall" },
  { name: "Hoàng Minh Anh", pct: 89, role: "BLOAN · CMT8" },
  { name: "Lê Quốc Khánh", pct: 88, role: "BLOAN · Crescent Mall" },
];

const violationByStore = [
  { name: "Quận 1", value: 35, color: "#f59e0b" },
  { name: "Quận 7", value: 25, color: "#3b82f6" },
  { name: "Quận 3", value: 20, color: "#10b981" },
  { name: "Thủ Đức", value: 15, color: "#ec4899" },
  { name: "Kho Tổng", value: 5, color: "#94a3b8" },
];

const performanceData = [
  {
    name: "Nguyễn Thùy Dương",
    store: "BLOAN · Lê Lợi (Q1)",
    role: "Thu ngân / Pha chế",
    shifts: 24,
    hours: "192h",
    stars: 5,
    violations: 0,
    bonus: "+1.200.000 đ",
    penalty: "0 đ",
    rate: 98.2,
  },
  {
    name: "Đỗ Văn Hùng",
    store: "BLOAN · Tú Xương (Q3)",
    role: "Phục vụ / Bếp",
    shifts: 22,
    hours: "176h",
    stars: 4,
    violations: 1,
    bonus: "+850.000 đ",
    penalty: "-50.000 đ",
    rate: 95.4,
  },
  {
    name: "Lê Quốc Khánh",
    store: "BLOAN · Crescent Mall (Q7)",
    role: "Kho vận / Điều phối",
    shifts: 20,
    hours: "160h",
    stars: 3,
    violations: 3,
    bonus: "+200.000 đ",
    penalty: "-350.000 đ",
    rate: 82.1,
  },
  {
    name: "Phạm Hoàng Nam",
    store: "BLOAN · Giga Mall (Thủ Đức)",
    role: "Thu ngân chính",
    shifts: 25,
    hours: "200h",
    stars: 5,
    violations: 0,
    bonus: "+1.500.000 đ",
    penalty: "0 đ",
    rate: 96.8,
  },
];

const exportCards = [
  {
    title: "Danh sách ca làm việc",
    desc: "Chi tiết giờ check-in/out, tăng ca và nghỉ phép của 1,248 nhân sự toàn chuỗi.",
    formats: ["XLSX", "CSV"],
    icon: FileSpreadsheet,
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    title: "Bảng lương & Quyết toán chi phí",
    desc: "Báo cáo tổng quỹ lương, thưởng hiệu suất, phụ cấp và các khoản khấu trừ nội bộ.",
    formats: ["PDF", "XLSX"],
    icon: FileText,
    color: "text-blue-600 bg-blue-50",
  },
  {
    title: "Hồ sơ vi phạm kỷ luật",
    desc: "Thống kê lỗi nội quy, biên bản vi phạm và kết quả giải quyết khiếu nại nhân viên.",
    formats: ["PDF", "DOCX"],
    icon: AlertTriangle,
    color: "text-rose-600 bg-rose-50",
  },
];

export default function ThongKePage() {
  const [search, setSearch] = useState("");

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Thống kê & Báo cáo hiệu suất chuỗi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Phân tích năng suất lao động, mức độ tuân thủ nội quy và xuất báo cáo tổng hợp Ăn Vặt BLOAN.
          </p>
        </div>
        <button
          onClick={() => alert("Đang xuất gói dữ liệu tổng hợp toàn chuỗi...")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold transition-all shadow-sm shadow-amber-200"
        >
          <Download className="w-4 h-4" />
          <span>Xuất dữ liệu tổng hợp</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm tên nhân viên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl outline-hidden hover:border-slate-300 focus:border-amber-400 transition-all font-medium text-slate-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 outline-hidden hover:border-slate-300">
            <option>Tất cả cửa hàng (24)</option>
            <option>BLOAN · Lê Lợi (Q1)</option>
            <option>BLOAN · Tú Xương (Q3)</option>
            <option>BLOAN · Giga Mall</option>
          </select>

          <select className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 outline-hidden hover:border-slate-300">
            <option>Tất cả bộ phận</option>
            <option>Thu ngân & Bán hàng</option>
            <option>Pha chế & Bếp</option>
            <option>Kho vận</option>
          </select>

          <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Tháng 10, 2026</span>
          </div>

          <button
            onClick={() => alert("Đang lọc dữ liệu theo bộ lọc...")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors shadow-2xs"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Lọc kết quả</span>
          </button>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top 5 Performers */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Top 5 Nhân sự xuất sắc nhất chuỗi</h3>
              </div>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                Tháng 10
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Xếp hạng dựa trên năng suất, điểm đánh giá khách hàng và tỷ lệ chuyên cần.
            </p>

            <div className="space-y-3">
              {top5Data.map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center shrink-0">
                    {i + 1}
                  </div>
                  <div className="w-36 shrink-0 truncate">
                    <p className="font-bold text-slate-800 text-xs">{d.name}</p>
                    <p className="text-[10px] text-slate-400">{d.role}</p>
                  </div>
                  <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden relative">
                    <div
                      className="h-full rounded-full flex items-center justify-end pr-2 transition-all"
                      style={{
                        width: `${d.pct}%`,
                        background: "linear-gradient(90deg, #fbbf24, #f59e0b)",
                      }}
                    >
                      <span className="text-[9px] text-slate-900 font-black">{d.pct}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 font-medium pt-3 mt-4 border-t border-slate-100">
            ⭐ Nhân sự đạt &gt;95% sẽ được tự động cộng thưởng KPI tháng
          </p>
        </div>

        {/* Violations by Store */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Tỷ lệ vi phạm theo khu vực</h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                -8% so với T9
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              Tỷ trọng số ca đi muộn & vi phạm đồng phục phân bổ theo cụm cửa hàng.
            </p>

            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie
                  data={violationByStore}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name} ${value}%`}
                  labelLine={false}
                >
                  {violationByStore.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-4 pt-3 border-t border-slate-100 text-xs">
            {violationByStore.map((item, idx) => (
              <span key={idx} className="flex items-center gap-1.5 text-slate-600 font-medium text-[11px]">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                {item.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Bảng đánh giá hiệu suất nhân sự chi tiết</h3>
            <p className="text-[11px] text-slate-400">Dữ liệu tổng hợp theo chu kỳ đánh giá tháng</p>
          </div>
          <span className="text-xs font-bold text-slate-500">Sắp xếp: Hiệu suất cao nhất ▾</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3">Nhân viên</th>
                <th className="px-5 py-3">Cửa hàng</th>
                <th className="px-5 py-3 text-center">Tổng ca</th>
                <th className="px-5 py-3 text-center">Tổng giờ</th>
                <th className="px-5 py-3 text-center">Đánh giá</th>
                <th className="px-5 py-3 text-center">Vi phạm</th>
                <th className="px-5 py-3 text-right">Thưởng</th>
                <th className="px-5 py-3 text-right">Phạt</th>
                <th className="px-5 py-3 text-right">Hiệu suất</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {performanceData.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center border border-amber-200 shrink-0">
                        {row.name.split(" ").slice(-1)[0].slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-xs">{row.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{row.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-600">{row.store}</td>
                  <td className="px-5 py-4 text-center font-bold text-slate-800">{row.shifts}</td>
                  <td className="px-5 py-4 text-center text-slate-600 font-medium">{row.hours}</td>
                  <td className="px-5 py-4 text-center">
                    <span className="text-amber-500 font-bold tracking-widest">
                      {"★".repeat(row.stars)}
                      <span className="text-slate-300">{"★".repeat(5 - row.stars)}</span>
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        row.violations === 0
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {row.violations} lỗi
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-emerald-600">{row.bonus}</td>
                  <td className="px-5 py-4 text-right font-bold text-rose-600">{row.penalty}</td>
                  <td className="px-5 py-4 text-right">
                    <div>
                      <p className="font-black text-slate-900 text-sm">{row.rate}%</p>
                      <div className="w-20 bg-slate-100 rounded-full h-1.5 ml-auto mt-1">
                        <div
                          className="h-full rounded-full bg-amber-500"
                          style={{ width: `${row.rate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Cards */}
      <div>
        <h3 className="font-bold text-slate-800 text-base mb-3">Tùy chọn xuất báo cáo & Sao lưu</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {exportCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <button
                      onClick={() => alert(`Đang tải báo cáo: ${card.title}`)}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                      title="Tải về"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mt-3">{card.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">{card.desc}</p>
                </div>
                <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-slate-100">
                  {card.formats.map((fmt, j) => (
                    <span
                      key={j}
                      className="text-[10px] font-black px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200/60"
                    >
                      {fmt}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
