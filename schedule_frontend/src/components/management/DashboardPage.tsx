"use client";

import React, { useState } from "react";
import {
  Store,
  Users,
  CalendarCheck,
  FileWarning,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Check,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const salaryData = [
  { month: "Th 5", value: 1100 },
  { month: "Th 6", value: 1320 },
  { month: "Th 7", value: 1200 },
  { month: "Th 8", value: 1450 },
  { month: "Th 9", value: 1500 },
  { month: "Th 10", value: 1380 },
];

const attendanceTrendData = [
  { day: "Thứ 2", dungGio: 410, diMuon: 8 },
  { day: "Thứ 3", dungGio: 415, diMuon: 6 },
  { day: "Thứ 4", dungGio: 400, diMuon: 10 },
  { day: "Thứ 5", dungGio: 420, diMuon: 7 },
  { day: "Thứ 6", dungGio: 430, diMuon: 12 },
  { day: "Thứ 7", dungGio: 380, diMuon: 9 },
  { day: "CN", dungGio: 390, diMuon: 8 },
];

const requestStatusData = [
  { name: "Đã duyệt", value: 85, color: "#10b981" },
  { name: "Chờ xử lý", value: 12, color: "#f59e0b" },
  { name: "Từ chối", value: 3, color: "#ef4444" },
];

const staffByStoreData = [
  { store: "Q1 Store", nv: 120 },
  { store: "Q3 Store", nv: 95 },
  { store: "Bình Thạnh", nv: 150 },
  { store: "Thủ Đức", nv: 80 },
  { store: "Q7 Mall", nv: 210 },
  { store: "Q10 Store", nv: 110 },
  { store: "Tân Bình", nv: 135 },
];

const recentRequests = [
  { initials: "TH", name: "Trần Hùng", type: "Đổi ca làm", date: "05/10/2026", status: "Chờ duyệt" },
  { initials: "LM", name: "Lê Minh", type: "Hủy ca làm", date: "04/10/2026", status: "Chờ duyệt" },
  { initials: "PA", name: "Phương Anh", type: "Xin nghỉ phép", date: "04/10/2026", status: "Đã duyệt" },
];

const violations = [
  { name: "Nguyễn Văn A", time: "10:15", desc: "Đi muộn > 15 phút tại CH Nguyễn Trãi", tag: "NHẮC NHỞ", tagColor: "bg-amber-100 text-amber-700" },
  { name: "Phạm Bích T", time: "Hôm qua", desc: "Nghỉ ca không phép", tag: "CẢNH CÁO", tagColor: "bg-red-100 text-red-700" },
  { name: "Lý Hải N", time: "Hôm qua", desc: "Sai quy định đồng phục", tag: "NHẮC NHỞ", tagColor: "bg-amber-100 text-amber-700" },
];

const todos = [
  { id: 1, text: "Phê duyệt đơn nghỉ phép - T10", sub: "6 yêu cầu đang chờ từ cửa hàng Q1", tag: "ƯU TIÊN CAO", deadline: "Hết hạn: 17:00", done: false, tagColor: "bg-red-100 text-red-700" },
  { id: 2, text: "Gửi báo cáo doanh thu tuần 3", sub: "Cần hoàn thành trước cuộc họp sáng mai", tag: "BÁO CÁO", done: false, tagColor: "bg-blue-100 text-blue-700" },
  { id: 3, text: "Check bảng lương nhân viên mới", sub: "Đã hoàn thành lúc 09:15", tag: "", done: true, tagColor: "" },
];

const statCards = [
  { label: "CỬA HÀNG", value: "24", icon: <Store size={18} className="text-blue-600" />, iconBg: "bg-blue-100", change: null },
  { label: "NHÂN VIÊN", value: "1,250", icon: <Users size={18} className="text-green-600" />, iconBg: "bg-green-100", change: null },
  { label: "CA HÔM NAY", value: "450", icon: <CalendarCheck size={18} className="text-orange-500" />, iconBg: "bg-orange-100", change: null },
  { label: "YÊU CẦU CHỜ", value: "12", icon: <FileWarning size={18} className="text-amber-500" />, iconBg: "bg-amber-100", change: "text-amber-600" },
  { label: "VI PHẠM MỚI", value: "5", icon: <AlertTriangle size={18} className="text-red-500" />, iconBg: "bg-red-100", change: "text-red-600" },
  { label: "TỶ LỆ CC", value: "98.5%", icon: <TrendingUp size={18} className="text-teal-600" />, iconBg: "bg-teal-100", change: null },
  { label: "LƯƠNG (T10)", value: "2.4B", icon: <div className="w-[18px] h-[18px] text-emerald-600 font-bold text-xs flex items-center justify-center">₫</div>, iconBg: "bg-emerald-100", change: null },
];

export default function DashboardPage() {
  const [doneTodos, setDoneTodos] = useState<number[]>([3]);

  const toggleTodo = (id: number) => {
    setDoneTodos((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs">
            <div className={`w-8 h-8 rounded-lg ${card.iconBg} flex items-center justify-center mb-2`}>
              {card.icon}
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.label}</p>
            <p className={`text-xl font-extrabold mt-0.5 ${card.change || "text-slate-800"}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Row 2: Line chart + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
          <h3 className="font-bold text-slate-800 mb-1">Xu hướng chấm công (7 ngày qua)</h3>
          <div className="flex items-center gap-4 mb-4">
            <span className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-3 h-0.5 bg-amber-400 inline-block rounded" /> Đúng giờ</span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-3 h-0.5 bg-red-400 inline-block rounded" /> Đi muộn</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={attendanceTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Line type="monotone" dataKey="dungGio" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: "#f59e0b", r: 3 }} />
              <Line type="monotone" dataKey="diMuon" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
          <h3 className="font-bold text-slate-800 mb-4">Trạng thái yêu cầu</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={requestStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {requestStatusData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1.5">
            {requestStatusData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-600">{d.name}</span>
                </div>
                <span className="font-bold text-slate-800">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Bar chart + Todo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
          <h3 className="font-bold text-slate-800 mb-4">Phân bổ nhân sự theo cửa hàng</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={staffByStoreData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="store" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Bar dataKey="nv" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">Cần làm hôm nay</h3>
            <button className="text-amber-500 text-xs font-semibold hover:text-amber-600">Xem tất cả</button>
          </div>
          <div className="space-y-3">
            {todos.map((todo) => {
              const isDone = doneTodos.includes(todo.id);
              return (
                <div key={todo.id} className="flex items-start gap-2.5">
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${isDone ? "bg-emerald-500 border-emerald-500" : "border-slate-300 hover:border-amber-400"}`}
                  >
                    {isDone && <Check size={10} className="text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isDone ? "line-through text-slate-400" : "text-slate-800"}`}>{todo.text}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{todo.sub}</p>
                    {todo.tag && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${todo.tagColor}`}>{todo.tag}</span>
                        {todo.deadline && <span className="text-[10px] text-slate-400">{todo.deadline}</span>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <button className="mt-4 w-full py-2 rounded-xl border border-dashed border-slate-300 text-xs text-slate-500 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1">
            <Plus size={13} /> Thêm nhiệm vụ mới
          </button>
        </div>
      </div>

      {/* Row 4: Recent requests + Violations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">Yêu cầu mới nhất</h3>
            <button className="text-amber-500 text-xs font-semibold hover:text-amber-600">Xem tất cả</button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-semibold text-slate-400 uppercase border-b border-slate-100">
                <th className="pb-2.5 text-left font-semibold">Nhân viên</th>
                <th className="pb-2.5 text-left font-semibold">Loại yêu cầu</th>
                <th className="pb-2.5 text-left font-semibold">Ngày gửi</th>
                <th className="pb-2.5 text-left font-semibold">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentRequests.map((req, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">{req.initials}</div>
                      <span className="font-medium text-slate-800">{req.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-slate-600">{req.type}</td>
                  <td className="py-3 text-slate-500">{req.date}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${req.status === "Chờ duyệt" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
          <h3 className="font-bold text-slate-800 mb-4">Vi phạm gần đây</h3>
          <div className="space-y-3">
            {violations.map((v, i) => (
              <div key={i} className="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-0">
                <div className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center shrink-0">
                  <AlertTriangle size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-800">{v.name}</span>
                    <span className="text-[11px] text-slate-400">{v.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{v.desc}</p>
                  <span className={`mt-1 inline-block text-[10px] font-bold px-1.5 py-0.5 rounded ${v.tagColor}`}>{v.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
