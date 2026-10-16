import React from "react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { chartAxisTick, chartColors, chartTooltipStyle } from "@/lib/theme";
import { ATTENDANCE_TREND, REQUEST_STATUS, STAFF_BY_STORE } from "./data";

const panel = "rounded-2xl border border-slate-200/80 bg-surface p-5 shadow-xs";
const margin = { top: 10, right: 10, left: -20, bottom: 0 };

export function AttendanceTrendChart() {
  return (
    <div className={`${panel} lg:col-span-2`}>
      <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Xu hướng chấm công (7 ngày qua)</h3>
          <p className="text-[11px] text-slate-400">Tỷ lệ đi làm đúng giờ và đi muộn toàn chuỗi</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 font-medium text-slate-600">
            <span className="h-1 w-3 rounded-full bg-brand-500" /> Đúng giờ
          </span>
          <span className="flex items-center gap-1.5 font-medium text-slate-600">
            <span className="h-1 w-3 rounded-full bg-red-500" /> Đi muộn
          </span>
        </div>
      </div>
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={ATTENDANCE_TREND} margin={margin}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
            <XAxis dataKey="day" tick={chartAxisTick} axisLine={false} tickLine={false} />
            <YAxis tick={chartAxisTick} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Line type="monotone" dataKey="dungGio" stroke={chartColors.brand} strokeWidth={3} dot={{ fill: chartColors.brand, r: 4 }} />
            <Line type="monotone" dataKey="diMuon" stroke={chartColors.danger} strokeWidth={2.5} dot={{ fill: chartColors.danger, r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function RequestStatusChart() {
  return (
    <div className={`${panel} flex flex-col justify-between`}>
      <div>
        <h3 className="mb-1 text-sm font-bold text-slate-800">Trạng thái yêu cầu</h3>
        <p className="mb-3 text-[11px] text-slate-400">Tỷ lệ giải quyết đơn ca tuần này</p>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={REQUEST_STATUS} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                {REQUEST_STATUS.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={chartTooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="space-y-2 border-t border-slate-100 pt-2 text-xs">
        {REQUEST_STATUS.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="font-medium text-slate-600">{item.name}</span>
            </div>
            <span className="font-bold text-slate-800">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StaffByStoreChart() {
  return (
    <div className={`${panel} lg:col-span-2`}>
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-800">Phân bổ nhân sự theo cửa hàng</h3>
        <p className="text-[11px] text-slate-400">Số lượng nhân sự hoạt động tại các chi nhánh trọng điểm</p>
      </div>
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={STAFF_BY_STORE} margin={margin}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
            <XAxis dataKey="store" tick={chartAxisTick} axisLine={false} tickLine={false} />
            <YAxis tick={chartAxisTick} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Bar dataKey="nv" fill={chartColors.brand} radius={[6, 6, 0, 0]} maxBarSize={44} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
