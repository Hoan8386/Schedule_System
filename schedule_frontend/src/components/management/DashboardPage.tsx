"use client";

import React, { useState } from "react";
import {
  Store,
  Users,
  CalendarCheck,
  FileWarning,
  AlertTriangle,
  TrendingUp,
  Clock,
  Plus,
  Check,
  ArrowRight,
  ShieldAlert,
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
  CartesianGrid,
} from "recharts";

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
  { name: "Đã duyệt", value: 85, color: "#10B981" },
  { name: "Chờ xử lý", value: 12, color: "#F59E0B" },
  { name: "Từ chối", value: 3, color: "#EF4444" },
];

const staffByStoreData = [
  { store: "Nguyễn Trãi", nv: 120 },
  { store: "CMT8", nv: 95 },
  { store: "Lê Lợi", nv: 150 },
  { store: "Quang Trung", nv: 80 },
  { store: "Tú Xương", nv: 110 },
  { store: "Sư Vạn Hạnh", nv: 130 },
];

const recentRequests = [
  { initials: "TH", name: "Trần Hùng", code: "NV-8821", store: "CH Nguyễn Trãi", type: "Đổi ca làm", date: "05/10/2026", status: "Chờ duyệt" },
  { initials: "LM", name: "Lê Minh", code: "NV-3392", store: "CH Lê Lợi", type: "Hủy ca làm", date: "04/10/2026", status: "Chờ duyệt" },
  { initials: "PA", name: "Phương Anh", code: "NV-1044", store: "CH CMT8", type: "Xin nghỉ phép", date: "04/10/2026", status: "Đã duyệt" },
];

const violations = [
  { name: "Nguyễn Văn An", time: "10:15 Hôm nay", desc: "Đi muộn > 15 phút tại CH Nguyễn Trãi", tag: "Nhắc nhở", tagColor: "bg-amber-50 text-amber-700 border-amber-200" },
  { name: "Phạm Bích Trâm", time: "Hôm qua", desc: "Nghỉ ca không phép tại CH Lê Lợi", tag: "Cảnh cáo", tagColor: "bg-red-50 text-red-700 border-red-200" },
  { name: "Lý Hải Nam", time: "Hôm qua", desc: "Sai quy định đồng phục tại CH CMT8", tag: "Nhắc nhở", tagColor: "bg-amber-50 text-amber-700 border-amber-200" },
];

const todos = [
  { id: 1, text: "Phê duyệt đơn đăng ký ca chuỗi - Tuần 12-18/10", sub: "12 yêu cầu đang chờ từ các cửa hàng", tag: "Ưu tiên cao", deadline: "Hôm nay 17:00", done: false },
  { id: 2, text: "Gửi báo cáo doanh thu & nhân sự tuần 1", sub: "Hoàn tất trước cuộc họp giao ban", tag: "Báo cáo", deadline: "Sáng mai 08:30", done: false },
  { id: 3, text: "Kiểm tra bảng tính lương toàn chuỗi T10", sub: "Đã hoàn thành lúc 09:15", tag: "Lương", deadline: "Đã xong", done: true },
];

export default function DashboardPage() {
  const [doneTodos, setDoneTodos] = useState<number[]>([3]);

  const toggleTodo = (id: number) => {
    setDoneTodos((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Tổng quan hệ thống
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi toàn bộ hoạt động chuỗi 24 cửa hàng và 1.250 nhân sự Ăn Vặt BLOAN.
          </p>
        </div>
        <button
          onClick={() => alert("Mở cấu hình lịch ca toàn chuỗi")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold transition-all shadow-sm shadow-amber-200"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Tạo kỳ ca mới</span>
        </button>
      </div>

      {/* Scope Line */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="font-semibold text-slate-600">
          Tháng 10/2026 · Toàn chuỗi BLOAN · Lũy kế thời gian thực
        </span>
        <span className="px-2.5 py-1 rounded-md bg-slate-100 font-semibold text-slate-600">
          Phạm vi: Toàn hệ thống (24 cửa hàng)
        </span>
      </div>

      {/* 4 Large Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">Cửa hàng hoạt động</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-800 tracking-tight">24 cửa hàng</div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">100% đang mở cửa hoạt động</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">Tổng nhân sự chuỗi</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-800 tracking-tight">1.250 nhân sự</div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">98.5% tỷ lệ chấm công đúng giờ</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">Ca làm hôm nay</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-800 tracking-tight">450 ca</div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">12 yêu cầu đang chờ phê duyệt</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">Ngân sách lương T10</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
              ₫
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-800 tracking-tight">2.4 Tỷ VND</div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">Ước tính theo tiến độ 05/10</div>
          </div>
        </div>
      </div>

      {/* Row 2: Line chart + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Xu hướng chấm công (7 ngày qua)</h3>
              <p className="text-[11px] text-slate-400">Tỷ lệ đi làm đúng giờ và đi muộn toàn chuỗi</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-3 h-1 bg-amber-500 rounded-full" /> Đúng giờ
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-3 h-1 bg-red-500 rounded-full" /> Đi muộn
              </span>
            </div>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
                <Line type="monotone" dataKey="dungGio" stroke="#F59E0B" strokeWidth={3} dot={{ fill: "#F59E0B", r: 4 }} />
                <Line type="monotone" dataKey="diMuon" stroke="#EF4444" strokeWidth={2.5} dot={{ fill: "#EF4444", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">Trạng thái yêu cầu</h3>
            <p className="text-[11px] text-slate-400 mb-3">Tỷ lệ giải quyết đơn ca tuần này</p>

            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={requestStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {requestStatusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            {requestStatusData.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-600 font-medium">{d.name}</span>
                </div>
                <span className="font-bold text-slate-800">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Staff Distribution & Todo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Phân bổ nhân sự theo cửa hàng</h3>
              <p className="text-[11px] text-slate-400">Số lượng nhân sự hoạt động tại các chi nhánh trọng điểm</p>
            </div>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={staffByStoreData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="store" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
                <Bar dataKey="nv" fill="#F59E0B" radius={[6, 6, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Todo List */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800">Nhiệm vụ quản lý</h3>
              <span className="text-[11px] font-bold text-amber-600">
                {todos.filter((t) => !doneTodos.includes(t.id)).length} việc cần làm
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {todos.map((todo) => {
                const isDone = doneTodos.includes(todo.id);
                return (
                  <div
                    key={todo.id}
                    onClick={() => toggleTodo(todo.id)}
                    className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50/70 cursor-pointer transition-colors"
                  >
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        isDone ? "bg-amber-500 border-amber-500 text-slate-900" : "border-slate-300"
                      }`}
                    >
                      {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div className="flex-1">
                      <p className={`font-bold ${isDone ? "line-through text-slate-400" : "text-slate-800"}`}>
                        {todo.text}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{todo.sub}</p>
                      <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600">
                        {todo.deadline}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => alert("Thêm nhiệm vụ mới")}
            className="mt-4 w-full py-2.5 rounded-xl border border-dashed border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm nhiệm vụ mới</span>
          </button>
        </div>
      </div>

      {/* Row 4: Recent Requests + Violations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Requests (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Yêu cầu đổi / hủy ca mới nhất
            </h3>
            <button
              onClick={() => alert("Chuyển đến trang Xử lý yêu cầu")}
              className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                  <th className="py-2.5 px-4">Nhân viên</th>
                  <th className="py-2.5 px-4">Cửa hàng</th>
                  <th className="py-2.5 px-4">Loại yêu cầu</th>
                  <th className="py-2.5 px-4">Ngày gửi</th>
                  <th className="py-2.5 px-4 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentRequests.map((req, i) => (
                  <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">
                          {req.initials}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{req.name}</p>
                          <p className="text-[10px] text-slate-400">{req.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{req.store}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{req.type}</td>
                    <td className="py-3 px-4 text-slate-400">{req.date}</td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          req.status === "Chờ duyệt"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Violations (1 col) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">Vi phạm gần đây</h3>
            <span className="text-xs text-red-600 font-bold">5 mới</span>
          </div>

          <div className="space-y-3.5 text-xs">
            {violations.map((v, i) => (
              <div key={i} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-800">{v.name}</p>
                    <span className="text-[10px] text-slate-400">{v.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{v.desc}</p>
                  <span
                    className={`mt-1.5 inline-block text-[9px] font-bold px-2 py-0.5 rounded-md border ${v.tagColor}`}
                  >
                    {v.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
