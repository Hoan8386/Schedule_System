"use client";

import React, { useMemo, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge, Button, Card, CardHeader, EmptyState, Spinner } from "@/components/ui";
import type { StatDaily, StatEmployee, StatShift, StatStoreOption } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { chartAxisTick, chartColors, chartTooltipStyle } from "@/lib/theme";
import { cn } from "@/lib/cn";
import { RANGE_PRESETS, WORK_STATUS, formatHours, formatPercent, formatVnd, shortDay, type RangePreset } from "./utils";

const controlClass =
  "rounded-xl border border-slate-200 bg-surface px-3 py-2 text-xs font-medium text-slate-700 outline-hidden hover:border-slate-300 focus:border-brand-400";

// ------------------------------------------------------------------ Bộ lọc

interface StatFilterBarProps {
  preset: RangePreset;
  onPresetChange: (preset: RangePreset) => void;
  range: { from: string; to: string };
  onRangeChange: (range: { from: string; to: string }) => void;
  stores?: StatStoreOption[];
  storeId?: number;
  onStoreChange?: (storeId: number | undefined) => void;
  allStoresLabel?: string;
  loading?: boolean;
  onReload: () => void;
}

export function StatFilterBar({
  preset,
  onPresetChange,
  range,
  onRangeChange,
  stores,
  storeId,
  onStoreChange,
  allStoresLabel = "Tất cả cửa hàng",
  loading,
  onReload,
}: StatFilterBarProps) {
  return (
    <div className="card flex flex-col gap-3 p-4 text-xs md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <select
          aria-label="Khoảng thời gian"
          value={preset}
          onChange={(event) => onPresetChange(event.target.value as RangePreset)}
          className={controlClass}
        >
          {RANGE_PRESETS.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
        <input
          type="date"
          aria-label="Từ ngày"
          value={range.from}
          max={range.to}
          onChange={(event) => event.target.value && onRangeChange({ from: event.target.value, to: range.to })}
          className={controlClass}
        />
        <span className="text-slate-400">→</span>
        <input
          type="date"
          aria-label="Đến ngày"
          value={range.to}
          min={range.from}
          onChange={(event) => event.target.value && onRangeChange({ from: range.from, to: event.target.value })}
          className={controlClass}
        />
        {stores && onStoreChange && stores.length > 1 && (
          <select
            aria-label="Cửa hàng"
            value={storeId ?? ""}
            onChange={(event) => onStoreChange(event.target.value ? Number(event.target.value) : undefined)}
            className={controlClass}
          >
            <option value="">{allStoresLabel} ({stores.length})</option>
            {stores.map((store) => (
              <option key={store.storeId} value={store.storeId}>{store.storeName}</option>
            ))}
          </select>
        )}
      </div>
      <Button variant="secondary" size="sm" onClick={onReload} disabled={loading}>
        <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
        Làm mới
      </Button>
    </div>
  );
}

// ------------------------------------------------------------------ Thẻ số liệu

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "brand" | "blue" | "emerald" | "rose" | "violet";
}

const TONE: Record<NonNullable<StatCardProps["tone"]>, string> = {
  brand: "bg-brand-50 text-brand-600",
  blue: "bg-blue-50 text-blue-600",
  emerald: "bg-emerald-50 text-emerald-600",
  rose: "bg-rose-50 text-rose-600",
  violet: "bg-violet-50 text-violet-600",
};

export function StatCard({ label, value, hint, icon: Icon, tone = "brand" }: StatCardProps) {
  return (
    <div className="card flex items-start justify-between gap-3 p-5">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <p className="mt-1 truncate text-2xl font-black tracking-tight text-slate-800">{value}</p>
        {hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
      </div>
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", TONE[tone])}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ Biểu đồ theo ngày

export function DailyHoursChart({ data, title = "Giờ làm theo ngày" }: { data: StatDaily[]; title?: string }) {
  const hasData = data.some((item) => item.hours > 0);
  return (
    <Card>
      <CardHeader title={title} actions={<span className="text-[11px] text-slate-400">Chỉ tính ca đã hoàn thành</span>} />
      <div className="h-64 p-4">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
              <XAxis dataKey="date" tickFormatter={shortDay} tick={chartAxisTick} tickLine={false} minTickGap={8} />
              <YAxis tick={chartAxisTick} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={chartTooltipStyle}
                labelFormatter={(label) => formatDate(String(label))}
                formatter={(value, name) =>
                  name === "hours" ? [formatHours(Number(value)), "Giờ làm"] : [String(value), String(name)]
                }
              />
              <Bar dataKey="hours" fill={chartColors.brand} radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState className="h-full">Chưa có giờ làm trong khoảng thời gian này</EmptyState>
        )}
      </div>
    </Card>
  );
}

// ------------------------------------------------------------------ Bảng nhân viên

type EmployeeSort = "hours" | "wage" | "attendance" | "violations" | "score";

const SORTS: { value: EmployeeSort; label: string }[] = [
  { value: "hours", label: "Giờ làm nhiều nhất" },
  { value: "wage", label: "Tiền công cao nhất" },
  { value: "attendance", label: "Chuyên cần cao nhất" },
  { value: "score", label: "Điểm đánh giá cao nhất" },
  { value: "violations", label: "Vi phạm nhiều nhất" },
];

const sortValue = (item: StatEmployee, sort: EmployeeSort) => {
  switch (sort) {
    case "wage":
      return item.totalWage;
    case "attendance":
      return item.attendanceRate;
    case "violations":
      return item.violationCount;
    case "score":
      return item.averageScore ?? -1;
    default:
      return item.totalHours;
  }
};

interface EmployeeStatTableProps {
  employees: StatEmployee[];
  title?: string;
  showStore?: boolean;
  selectedId?: number;
  onSelect?: (employee: StatEmployee) => void;
  actions?: React.ReactNode;
}

export function EmployeeStatTable({ employees, title = "Thống kê nhân viên", showStore = true, selectedId, onSelect, actions }: EmployeeStatTableProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<EmployeeSort>("hours");

  const rows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return employees
      .filter((item) => !keyword || `${item.fullName ?? ""} ${item.employeeCode ?? ""}`.toLowerCase().includes(keyword))
      .sort((a, b) => sortValue(b, sort) - sortValue(a, sort));
  }, [employees, search, sort]);

  const total = rows.reduce(
    (sum, item) => ({ shifts: sum.shifts + item.completedShifts, hours: sum.hours + item.totalHours, wage: sum.wage + item.totalWage }),
    { shifts: 0, hours: 0, wage: 0 }
  );

  return (
    <Card>
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="card-title">{title}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm tên hoặc mã nhân viên"
              aria-label="Tìm nhân viên"
              className={cn(controlClass, "w-full pl-8 sm:w-56")}
            />
          </div>
          <select aria-label="Sắp xếp" value={sort} onChange={(event) => setSort(event.target.value as EmployeeSort)} className={controlClass}>
            {SORTS.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
          {actions}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold uppercase text-slate-400">
              <th className="px-4 py-3">Nhân viên</th>
              {showStore && <th className="px-4 py-3">Cửa hàng</th>}
              <th className="px-4 py-3 text-center">Ca hoàn thành</th>
              <th className="px-4 py-3 text-right">Giờ làm</th>
              <th className="px-4 py-3 text-right">Tiền công</th>
              <th className="px-4 py-3 text-center">Trễ / Vắng</th>
              <th className="px-4 py-3 text-center">Vi phạm</th>
              <th className="px-4 py-3 text-center">Đánh giá</th>
              <th className="px-4 py-3 text-right">Chuyên cần</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {rows.length === 0 && (
              <tr>
                <td colSpan={showStore ? 9 : 8} className="px-4 py-10 text-center text-slate-400">Không có nhân viên phù hợp</td>
              </tr>
            )}
            {rows.map((item) => (
              <tr
                key={item.employeeId}
                onClick={onSelect ? () => onSelect(item) : undefined}
                className={cn(
                  "transition-colors hover:bg-slate-50/70",
                  onSelect && "cursor-pointer",
                  selectedId === item.employeeId && "bg-brand-50/60"
                )}
              >
                <td className="px-4 py-3">
                  <p className="font-bold text-slate-800">{item.fullName ?? "—"}</p>
                  <p className="text-[11px] text-slate-400">{item.employeeCode ?? `#${item.employeeId}`}</p>
                </td>
                {showStore && <td className="px-4 py-3 text-slate-600">{item.stores || "—"}</td>}
                <td className="px-4 py-3 text-center font-bold">
                  {item.completedShifts}
                  <span className="font-normal text-slate-400"> / {item.scheduledShifts}</span>
                </td>
                <td className="px-4 py-3 text-right">{formatHours(item.totalHours)}</td>
                <td className="px-4 py-3 text-right font-bold text-slate-800">{formatVnd(item.totalWage)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={item.lateCount ? "font-bold text-brand-700" : "text-slate-400"}>{item.lateCount}</span>
                  <span className="text-slate-300"> / </span>
                  <span className={item.absentCount ? "font-bold text-rose-600" : "text-slate-400"}>{item.absentCount}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge tone={item.violationCount ? "danger" : "success"}>{item.violationCount} lỗi</Badge>
                </td>
                <td className="px-4 py-3 text-center">{item.averageScore ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  <p className="font-black text-slate-900">{formatPercent(item.attendanceRate)}</p>
                  <div className="ml-auto mt-1 h-1.5 w-20 rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.min(100, item.attendanceRate)}%` }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-slate-100 p-4 text-xs font-bold text-slate-700">
        Tổng · {rows.length} nhân viên: {total.shifts} ca · {formatHours(total.hours)} · {formatVnd(total.wage)}
      </div>
    </Card>
  );
}

// ------------------------------------------------------------------ Bảng lịch sử ca

interface ShiftHistoryTableProps {
  shifts: StatShift[];
  title: React.ReactNode;
  loading?: boolean;
  showEmployee?: boolean;
  actions?: React.ReactNode;
}

export function ShiftHistoryTable({ shifts, title, loading, showEmployee = false, actions }: ShiftHistoryTableProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const rows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return shifts.filter(
      (item) =>
        (!status || item.workStatus === status) &&
        (!keyword ||
          `${formatDate(item.workDate)} ${item.shiftName ?? ""} ${item.storeName ?? ""} ${item.employeeName ?? ""}`
            .toLowerCase()
            .includes(keyword))
    );
  }, [shifts, search, status]);

  const completed = rows.filter((item) => item.workStatus === "COMPLETED");
  const hours = completed.reduce((sum, item) => sum + item.hours, 0);
  const wage = completed.reduce((sum, item) => sum + item.wage, 0);

  return (
    <Card>
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="card-title">{title}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm ngày, ca hoặc cửa hàng"
              aria-label="Tìm ca"
              className={cn(controlClass, "w-full pl-8 sm:w-52")}
            />
          </div>
          <select aria-label="Lọc trạng thái ca" value={status} onChange={(event) => setStatus(event.target.value)} className={controlClass}>
            <option value="">Tất cả trạng thái</option>
            {Object.entries(WORK_STATUS).map(([key, item]) => (
              <option key={key} value={key}>{item.label}</option>
            ))}
          </select>
          {actions}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold uppercase text-slate-400">
              <th className="px-4 py-3">Ngày</th>
              {showEmployee && <th className="px-4 py-3">Nhân viên</th>}
              <th className="px-4 py-3">Ca & giờ</th>
              <th className="px-4 py-3">Cửa hàng</th>
              <th className="px-4 py-3">Check-in / out</th>
              <th className="px-4 py-3 text-right">Giờ làm</th>
              <th className="px-4 py-3 text-right">Đơn giá / giờ</th>
              <th className="px-4 py-3 text-right">Tiền công</th>
              <th className="px-4 py-3 text-right">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {loading && (
              <tr>
                <td colSpan={showEmployee ? 9 : 8} className="px-4 py-8">
                  <Spinner label="Đang tải lịch sử ca..." />
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={showEmployee ? 9 : 8} className="px-4 py-10 text-center text-slate-400">Không có ca nào</td>
              </tr>
            )}
            {!loading &&
              rows.map((item) => {
                const meta = WORK_STATUS[item.workStatus] ?? WORK_STATUS.UPCOMING;
                return (
                  <tr key={item.assignmentId} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-bold text-slate-800">{formatDate(item.workDate)}</td>
                    {showEmployee && <td className="px-4 py-3">{item.employeeName ?? "—"}</td>}
                    <td className="px-4 py-3">
                      {item.shiftName ?? "Ca"} · {item.startTime ?? "--:--"} – {item.endTime ?? "--:--"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.storeName ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {item.checkInAt ? item.checkInAt.slice(11, 16) : "--:--"} / {item.checkOutAt ? item.checkOutAt.slice(11, 16) : "--:--"}
                      {item.attendanceStatus === "LATE" && <Badge tone="warning" className="ml-2">Trễ</Badge>}
                    </td>
                    <td className="px-4 py-3 text-right">{item.hours ? formatHours(item.hours) : "—"}</td>
                    <td className="px-4 py-3 text-right">{formatVnd(item.payRate)}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800">{item.wage ? formatVnd(item.wage) : "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      <div className="border-t border-slate-100 p-4 text-xs text-slate-500">
        {rows.length} ca · {completed.length} hoàn thành · {formatHours(hours)} · {formatVnd(wage)}
      </div>
    </Card>
  );
}
