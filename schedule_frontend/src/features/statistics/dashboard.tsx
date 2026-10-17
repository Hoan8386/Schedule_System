"use client";

import React, { useCallback, useState } from "react";
import { AlertCircle, CalendarClock, Check, ListTodo } from "lucide-react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge, Card, CardHeader, EmptyState } from "@/components/ui";
import type { ApiResponse, DashAttendanceDay, DashRequest, DashRound, DashShift, DashTodo } from "@/lib/api";
import { formatDate, formatDateTime } from "@/lib/format";
import { chartAxisTick, chartColors, chartTooltipStyle } from "@/lib/theme";
import { cn } from "@/lib/cn";
import { useKeyedLoad } from "./useStatistics";
import { WORK_STATUS, formatHours, formatVnd, shortDay } from "./utils";

/** Tải dữ liệu trang tổng quan một lần, có nút làm mới. */
export function useDashboard<T>(load: () => Promise<ApiResponse<T>>) {
  const [version, setVersion] = useState(0);
  const result = useKeyedLoad(`dashboard|${version}`, load, "Không thể tải dữ liệu tổng quan");
  const reload = useCallback(() => setVersion((value) => value + 1), []);
  return { ...result, reload };
}

export function greeting(name?: string | null) {
  const hour = new Date().getHours();
  const period = hour < 11 ? "Chào buổi sáng" : hour < 14 ? "Chào buổi trưa" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";
  const shortName = name?.trim().split(/\s+/).slice(-2).join(" ");
  return shortName ? `${period}, ${shortName}` : period;
}

export function todayLabel() {
  return new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });
}

export const REQUEST_TYPE_LABEL: Record<string, string> = {
  REGISTER: "Đăng ký ca",
  ADD: "Đăng ký thêm",
  CHANGE: "Đổi ca",
  CANCEL: "Hủy ca",
};

export const REQUEST_STATUS: Record<string, { label: string; tone: "warning" | "success" | "danger" | "neutral" }> = {
  PENDING: { label: "Chờ duyệt", tone: "warning" },
  APPROVED: { label: "Đã duyệt", tone: "success" },
  REJECTED: { label: "Từ chối", tone: "danger" },
  CANCELLED: { label: "Đã hủy", tone: "neutral" },
};

export function RequestStatusBadge({ status }: { status?: string | null }) {
  const meta = REQUEST_STATUS[String(status ?? "").toUpperCase()] ?? { label: status ?? "—", tone: "neutral" as const };
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

export const requestShiftLabel = (item: DashRequest) =>
  item.workDate
    ? `${formatDate(item.workDate)} · ${item.shiftName ?? "Ca"}${item.startTime ? ` ${item.startTime} – ${item.endTime ?? ""}` : ""}`
    : "Chưa gắn ca";

// ------------------------------------------------------------------ Biểu đồ chuyên cần 7 ngày

export function AttendanceTrendCard({ data, className }: { data: DashAttendanceDay[]; className?: string }) {
  const hasData = data.some((day) => day.onTime + day.late + day.absent > 0);
  return (
    <Card className={className}>
      <CardHeader title="Chấm công 7 ngày qua" actions={<span className="text-[11px] text-slate-400">Số ca theo ngày</span>} />
      <div className="h-60 p-4">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
              <XAxis dataKey="date" tickFormatter={shortDay} tick={chartAxisTick} axisLine={false} tickLine={false} />
              <YAxis tick={chartAxisTick} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={chartTooltipStyle} labelFormatter={(label) => formatDate(String(label))} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="onTime" name="Đúng giờ" stroke={chartColors.brand} strokeWidth={3} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="late" name="Đi trễ" stroke={chartColors.warning} strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="absent" name="Vắng" stroke={chartColors.danger} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState className="h-full">Chưa có dữ liệu chấm công trong 7 ngày qua</EmptyState>
        )}
      </div>
    </Card>
  );
}

// ------------------------------------------------------------------ Ca làm

export function ShiftTile({ shift, highlight = false }: { shift: DashShift; highlight?: boolean }) {
  const date = shift.workDate ? new Date(`${shift.workDate}T00:00:00`) : null;
  const meta = WORK_STATUS[shift.workStatus] ?? WORK_STATUS.UPCOMING;
  return (
    <div className={cn("flex items-start gap-4 rounded-xl border p-3", highlight ? "border-brand-100 bg-brand-50/50" : "border-slate-100 bg-slate-50")}>
      <div className="flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-slate-200 bg-surface">
        <span className="text-[9px] font-bold uppercase text-brand-600">
          {date?.toLocaleDateString("vi-VN", { weekday: "short" }) ?? "—"}
        </span>
        <span className="text-xl font-black text-slate-800">{date ? String(date.getDate()).padStart(2, "0") : "--"}</span>
        <span className="text-[9px] text-slate-400">Tháng {date ? date.getMonth() + 1 : "--"}</span>
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base font-bold text-slate-800">
            {shift.shiftName ?? "Ca làm"} · {shift.startTime ?? "--:--"} – {shift.endTime ?? "--:--"}
          </span>
          <Badge tone={meta.tone}>{meta.label}</Badge>
        </div>
        <div className="text-xs text-slate-600">{shift.storeName ?? "—"}</div>
        <div className="text-xs font-semibold text-brand-700">
          {formatHours(shift.plannedHours)} · {formatVnd(shift.estimatedWage)}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ Việc cần làm

const PRIORITY: Record<string, { label: string; tone: "danger" | "warning" | "neutral" }> = {
  HIGH: { label: "Ưu tiên cao", tone: "danger" },
  MEDIUM: { label: "Trung bình", tone: "warning" },
  LOW: { label: "Thấp", tone: "neutral" },
};

export function TodoCard({ todos, onViewAll, className }: { todos: DashTodo[]; onViewAll?: () => void; className?: string }) {
  const open = todos.filter((todo) => todo.status !== "COMPLETED").length;
  return (
    <Card className={className}>
      <CardHeader
        title="Việc cần làm"
        icon={ListTodo}
        actions={
          <>
            <span className="text-[11px] font-bold text-brand-600">{open} việc chưa xong</span>
            {onViewAll && (
              <button onClick={onViewAll} className="text-[11px] font-bold text-slate-500 hover:text-brand-600 hover:underline">
                Xem tất cả
              </button>
            )}
          </>
        }
      />
      <div className="space-y-2.5 p-5 text-xs">
        {todos.length === 0 && <EmptyState>Không có việc nào được giao</EmptyState>}
        {todos.map((todo) => {
          const done = todo.status === "COMPLETED";
          const priority = PRIORITY[String(todo.priority ?? "").toUpperCase()];
          const overdue = !done && todo.dueAt && new Date(todo.dueAt) < new Date();
          return (
            <div key={todo.id} className="flex items-start gap-3 rounded-xl border border-slate-100 p-2.5">
              <div
                className={cn(
                  "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-md border",
                  done ? "border-brand-500 bg-brand-500 text-brand-contrast" : "border-slate-300"
                )}
              >
                {done && <Check className="h-3 w-3 stroke-[3]" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn("font-bold", done ? "text-slate-400 line-through" : "text-slate-800")}>{todo.title}</p>
                {todo.description && <p className="mt-0.5 truncate text-[10px] text-slate-400">{todo.description}</p>}
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  {priority && !done && <Badge tone={priority.tone}>{priority.label}</Badge>}
                  {todo.dueAt && (
                    <span className={cn("text-[10px] font-semibold", overdue ? "text-rose-600" : "text-slate-500")}>
                      {overdue ? "Quá hạn · " : "Hạn "}
                      {formatDateTime(todo.dueAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ------------------------------------------------------------------ Thông báo đợt đăng ký

export function OpenRoundsNotice({ rounds, extra }: { rounds: DashRound[]; extra?: React.ReactNode }) {
  if (rounds.length === 0 && !extra) return null;
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-brand-200/80 bg-brand-50/70 p-4 text-xs text-brand-900">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
      <div className="space-y-1">
        {rounds.map((round) => (
          <p key={round.id}>
            <CalendarClock className="mr-1 inline h-3.5 w-3.5" />
            Đợt <strong>{round.roundName}</strong>
            {round.storeName ? ` (${round.storeName})` : ""} đang mở đăng ký
            {round.registrationEndAt ? `, đóng lúc ${formatDateTime(round.registrationEndAt)}` : ""}.
          </p>
        ))}
        {extra}
      </div>
    </div>
  );
}
