"use client";

import React, { useMemo, useState } from "react";
import { ArrowLeftRight, Calendar as CalendarIcon, CalendarX, ChevronLeft, ChevronRight, Clock, Plus } from "lucide-react";
import { Alert, Badge, Button, Card, EmptyState, Spinner } from "@/components/ui";
import { statisticsApi, type StatShift } from "@/lib/api";
import { localKey } from "@/lib/format";
import { cn } from "@/lib/cn";
import { REQUEST_TYPE_LABEL } from "@/features/statistics/dashboard";
import { useStatData } from "@/features/statistics/useStatistics";
import { WORK_STATUS, formatHours, formatVnd } from "@/features/statistics/utils";

interface EmployeeSchedulePageProps {
  onOpenRegister: () => void;
  onOpenSwap: () => void;
  onOpenCancel: () => void;
}

type ViewMode = "week" | "month";
type StatusFilter = "all" | "confirmed" | "pending" | "changing" | "done" | "absent";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "confirmed", label: "Đã xác nhận (sắp tới)" },
  { value: "pending", label: "Chờ duyệt đăng ký" },
  { value: "changing", label: "Chờ đổi / hủy" },
  { value: "done", label: "Đã hoàn thành" },
  { value: "absent", label: "Vắng mặt" },
];

const WEEKDAYS = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"];

const controlClass =
  "rounded-xl border border-slate-200 bg-surface px-3 py-2 text-xs font-medium text-slate-700 outline-hidden hover:border-slate-300";

const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
const startOfWeek = (date: Date) => addDays(date, -((date.getDay() + 6) % 7));

/** Ngày đầu / cuối của khung đang xem (tuần: T2–CN; tháng: đủ các tuần chứa tháng). */
function visibleRange(anchor: Date, view: ViewMode) {
  if (view === "week") {
    const start = startOfWeek(anchor);
    return { start, end: addDays(start, 6) };
  }
  const start = startOfWeek(new Date(anchor.getFullYear(), anchor.getMonth(), 1));
  const end = addDays(startOfWeek(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0)), 6);
  return { start, end };
}

function plannedHours(shift: StatShift) {
  if (shift.workStatus === "COMPLETED") return shift.hours;
  if (!shift.startTime || !shift.endTime) return 0;
  const [sh, sm] = shift.startTime.split(":").map(Number);
  const [eh, em] = shift.endTime.split(":").map(Number);
  let minutes = eh * 60 + em - (sh * 60 + sm);
  if (minutes < 0) minutes += 24 * 60; // ca qua đêm
  return minutes / 60;
}

const expectedWage = (shift: StatShift) =>
  shift.workStatus === "COMPLETED" ? shift.wage : Math.round(plannedHours(shift) * shift.payRate);

function matchesStatus(shift: StatShift, filter: StatusFilter) {
  switch (filter) {
    case "confirmed":
      return (shift.workStatus === "UPCOMING" || shift.workStatus === "IN_PROGRESS") && !shift.pendingRequestType;
    case "pending":
      return shift.workStatus === "PENDING";
    case "changing":
      return Boolean(shift.pendingRequestType);
    case "done":
      return shift.workStatus === "COMPLETED";
    case "absent":
      return shift.workStatus === "ABSENT";
    default:
      return shift.workStatus !== "CANCELLED";
  }
}

function rangeTitle(start: Date, end: Date, view: ViewMode, anchor: Date) {
  if (view === "month") return `Tháng ${anchor.getMonth() + 1}, ${anchor.getFullYear()}`;
  const sameMonth = start.getMonth() === end.getMonth();
  const day = (date: Date) => String(date.getDate()).padStart(2, "0");
  return sameMonth
    ? `${day(start)} – ${day(end)} tháng ${end.getMonth() + 1}, ${end.getFullYear()}`
    : `${day(start)}/${start.getMonth() + 1} – ${day(end)}/${end.getMonth() + 1}, ${end.getFullYear()}`;
}

/** Lịch làm việc của nhân viên theo tuần / tháng, lấy từ phân ca thật. */
export default function EmployeeSchedulePage({ onOpenRegister, onOpenSwap, onOpenCancel }: EmployeeSchedulePageProps) {
  const [view, setView] = useState<ViewMode>("week");
  const [anchor, setAnchor] = useState(() => new Date());
  const [storeId, setStoreId] = useState<number | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const { start, end } = visibleRange(anchor, view);
  const { data, loading, error } = useStatData(statisticsApi.getMine, { from: localKey(start), to: localKey(end), storeId });

  const todayKey = localKey(new Date());
  const shifts = useMemo(() => (data?.shifts ?? []).filter((shift) => matchesStatus(shift, statusFilter)), [data, statusFilter]);
  const shiftsByDate = useMemo(() => {
    const map = new Map<string, StatShift[]>();
    [...shifts]
      .sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? ""))
      .forEach((shift) => {
        if (!shift.workDate) return;
        map.set(shift.workDate, [...(map.get(shift.workDate) ?? []), shift]);
      });
    return map;
  }, [shifts]);

  // Tổng của khung đang xem (bỏ ca đã hủy)
  const totals = shifts.reduce(
    (sum, shift) => ({ count: sum.count + 1, hours: sum.hours + plannedHours(shift), wage: sum.wage + expectedWage(shift) }),
    { count: 0, hours: 0, wage: 0 }
  );

  // Ca nổi bật ở cuối trang: ca hôm nay, nếu không có thì ca sắp tới gần nhất trong khung.
  const spotlight =
    (data?.shifts ?? []).find((shift) => shift.workDate === todayKey && shift.workStatus !== "CANCELLED") ??
    (data?.shifts ?? [])
      .filter((shift) => shift.workDate && shift.workDate >= todayKey && (shift.workStatus === "UPCOMING" || shift.workStatus === "IN_PROGRESS"))
      .sort((a, b) => `${a.workDate}${a.startTime}`.localeCompare(`${b.workDate}${b.startTime}`))[0];

  const move = (direction: -1 | 1) =>
    setAnchor((current) =>
      view === "week" ? addDays(current, direction * 7) : new Date(current.getFullYear(), current.getMonth() + direction, 1)
    );

  const days = Array.from({ length: Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1 }, (_, index) => addDays(start, index));

  return (
    <div className="page">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="page-title">Lịch làm việc</h1>
          <p className="page-subtitle">Theo dõi ca của bạn, chủ động sắp xếp thời gian.</p>
        </div>
        <Button icon={Plus} onClick={onOpenRegister}>
          Đăng ký ca
        </Button>
      </div>

      <div className="flex flex-col justify-between gap-3 text-xs md:flex-row md:items-center">
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            aria-label="Cửa hàng"
            value={storeId ?? ""}
            onChange={(event) => setStoreId(event.target.value ? Number(event.target.value) : undefined)}
            className={controlClass}
          >
            <option value="">Tất cả cửa hàng</option>
            {(data?.stores ?? []).map((store) => (
              <option key={store.storeId} value={store.storeId}>{store.storeName}</option>
            ))}
          </select>
          <select aria-label="Trạng thái" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} className={controlClass}>
            {STATUS_FILTERS.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </div>
        <div className="text-xs font-semibold text-slate-500">
          {totals.count} ca · {formatHours(totals.hours)} · <span className="text-brand-600">Dự kiến {formatVnd(totals.wage)}</span>
        </div>
      </div>

      {error && <Alert>{error}</Alert>}

      <Card className="p-5">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex overflow-hidden rounded-xl border border-slate-200">
              <button aria-label="Trước" onClick={() => move(-1)} className="border-r border-slate-200 p-2 text-slate-600 hover:bg-slate-50">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button aria-label="Sau" onClick={() => move(1)} className="p-2 text-slate-600 hover:bg-slate-50">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <span className="text-sm font-bold text-slate-800">{rangeTitle(start, end, view, anchor)}</span>
            <button onClick={() => setAnchor(new Date())} className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
              Hôm nay
            </button>
            {loading && <Spinner />}
          </div>

          <div className="flex items-center rounded-xl bg-slate-100 p-1">
            {(["week", "month"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setView(mode)}
                className={cn(
                  "rounded-lg px-3 py-1 text-xs font-bold transition-all",
                  view === mode ? "bg-surface text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
                )}
              >
                {mode === "week" ? "Tuần" : "Tháng"}
              </button>
            ))}
          </div>
        </div>

        {view === "week" ? (
          <WeekGrid days={days} shiftsByDate={shiftsByDate} todayKey={todayKey} />
        ) : (
          <MonthGrid days={days} month={anchor.getMonth()} shiftsByDate={shiftsByDate} todayKey={todayKey} />
        )}

        {!loading && shifts.length === 0 && (
          <EmptyState className="mt-4">Không có ca nào trong khoảng thời gian này</EmptyState>
        )}

        <div className="mt-4 flex flex-col justify-between gap-3 border-t border-slate-100 pt-4 text-xs sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-4">
            <Legend className="bg-slate-300" label="Đã xác nhận" />
            <Legend className="bg-brand-400" label="Chờ duyệt / chờ đổi" />
            <Legend className="bg-emerald-400" label="Hoàn thành" />
            <Legend className="bg-rose-400" label="Vắng mặt" />
          </div>
          <span className="text-[11px] text-slate-400">Ca vẫn có hiệu lực cho đến khi yêu cầu đổi / hủy được duyệt.</span>
        </div>
      </Card>

      <Card className="flex flex-col justify-between gap-4 p-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-200 bg-brand-50 text-brand-600">
            <CalendarIcon className="h-5 w-5" />
          </div>
          {spotlight ? (
            <div>
              <h4 className="text-xs font-bold text-slate-800">
                {spotlight.workDate === todayKey ? "Hôm nay" : spotlightDate(spotlight.workDate)} · {spotlight.shiftName ?? "Ca làm"} tại{" "}
                {spotlight.storeName ?? "—"}
              </h4>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {spotlight.startTime ?? "--:--"} – {spotlight.endTime ?? "--:--"} · {formatHours(plannedHours(spotlight))} ·{" "}
                {formatVnd(expectedWage(spotlight))}
              </p>
            </div>
          ) : (
            <div>
              <h4 className="text-xs font-bold text-slate-800">Không có ca sắp tới trong khung đang xem</h4>
              <p className="mt-0.5 text-[11px] text-slate-500">Đăng ký thêm ca khi đợt đăng ký đang mở.</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="secondary" icon={ArrowLeftRight} onClick={onOpenSwap}>
            Yêu cầu đổi ca
          </Button>
          <Button variant="secondary" icon={CalendarX} onClick={onOpenCancel}>
            Yêu cầu hủy ca
          </Button>
        </div>
      </Card>
    </div>
  );
}

const spotlightDate = (workDate: string | null) =>
  workDate ? new Date(`${workDate}T00:00:00`).toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit" }) : "";

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 font-medium text-slate-600">
      <span className={cn("h-2.5 w-2.5 rounded-full", className)} />
      {label}
    </span>
  );
}

// ------------------------------------------------------------------ Ô ca

function shiftTone(shift: StatShift, isToday: boolean) {
  if (shift.workStatus === "ABSENT") return "border-rose-200 bg-rose-50";
  if (shift.workStatus === "COMPLETED") return "border-emerald-200 bg-emerald-50/70";
  if (shift.workStatus === "PENDING" || shift.pendingRequestType) return "border-brand-200 bg-brand-50/60";
  return isToday ? "border-brand-300 bg-brand-50/70 shadow-xs" : "border-slate-200/80 bg-slate-50";
}

function ShiftChip({ shift, isToday, compact = false }: { shift: StatShift; isToday: boolean; compact?: boolean }) {
  const meta = WORK_STATUS[shift.workStatus] ?? WORK_STATUS.UPCOMING;
  const pendingLabel = shift.pendingRequestType ? `Chờ ${(REQUEST_TYPE_LABEL[shift.pendingRequestType] ?? "thay đổi").toLowerCase()}` : null;

  if (compact) {
    return (
      <div className={cn("truncate rounded-md border px-1.5 py-0.5 text-[10px] font-semibold text-slate-700", shiftTone(shift, isToday))}>
        {shift.startTime ?? "--:--"} {shift.shiftName ?? "Ca"}
      </div>
    );
  }
  return (
    <div className={cn("flex flex-col justify-between gap-1 rounded-xl border p-2.5", shiftTone(shift, isToday))}>
      <div>
        <p className="text-xs font-bold text-slate-800">{shift.shiftName ?? "Ca làm"}</p>
        <p className="mt-0.5 text-[10px] text-slate-500">
          {shift.startTime ?? "--:--"} – {shift.endTime ?? "--:--"}
        </p>
        <p className="truncate text-[10px] text-slate-400">{shift.storeName ?? "—"}</p>
      </div>
      <div className="flex flex-wrap gap-1">
        <Badge tone={meta.tone} className="px-1.5 py-0.5 text-[9px]">{meta.label}</Badge>
        {pendingLabel && <Badge tone="warning" className="px-1.5 py-0.5 text-[9px]">{pendingLabel}</Badge>}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ Lưới tuần

function WeekGrid({ days, shiftsByDate, todayKey }: { days: Date[]; shiftsByDate: Map<string, StatShift[]>; todayKey: string }) {
  // Mỗi hàng là một khung ca (tên + giờ bắt đầu) xuất hiện trong tuần
  const slots = useMemo(() => {
    const map = new Map<string, { name: string; start: string }>();
    days.forEach((day) =>
      (shiftsByDate.get(localKey(day)) ?? []).forEach((shift) => {
        const key = `${shift.startTime ?? ""}|${shift.shiftName ?? ""}`;
        if (!map.has(key)) map.set(key, { name: shift.shiftName ?? "Ca", start: shift.startTime ?? "--:--" });
      })
    );
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [days, shiftsByDate]);

  return (
    <div className="mt-4 overflow-x-auto">
      <div className="min-w-200">
        <div className="grid grid-cols-8 gap-2 border-b border-slate-100 pb-3 text-center">
          <div className="flex items-center justify-center text-slate-400">
            <Clock className="h-4 w-4" />
          </div>
          {days.map((day, index) => {
            const isToday = localKey(day) === todayKey;
            return (
              <div key={index} className={cn("rounded-xl py-1", isToday && "bg-brand-50/80 font-bold")}>
                <p className="text-[11px] text-slate-400">{WEEKDAYS[index]}</p>
                <p className={cn("text-base font-extrabold", isToday ? "text-brand-600" : "text-slate-800")}>
                  {String(day.getDate()).padStart(2, "0")}
                </p>
              </div>
            );
          })}
        </div>

        {slots.map(([key, slot], rowIndex) => (
          <div
            key={key}
            className={cn("grid min-h-22.5 grid-cols-8 items-stretch gap-2 py-3", rowIndex < slots.length - 1 && "border-b border-slate-100")}
          >
            <div className="pt-2 text-center text-[11px] font-medium text-slate-400">
              <p>{slot.name}</p>
              <p className="text-[10px] text-slate-300">{slot.start}</p>
            </div>
            {days.map((day) => {
              const dayKey = localKey(day);
              const items = (shiftsByDate.get(dayKey) ?? []).filter(
                (shift) => `${shift.startTime ?? ""}|${shift.shiftName ?? ""}` === key
              );
              return (
                <div key={dayKey} className="space-y-2">
                  {items.map((shift) => (
                    <ShiftChip key={shift.assignmentId} shift={shift} isToday={dayKey === todayKey} />
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ Lưới tháng

function MonthGrid({
  days,
  month,
  shiftsByDate,
  todayKey,
}: {
  days: Date[];
  month: number;
  shiftsByDate: Map<string, StatShift[]>;
  todayKey: string;
}) {
  return (
    <div className="mt-4 overflow-x-auto">
      <div className="min-w-175">
        <div className="grid grid-cols-7 gap-2 pb-2 text-center text-[11px] font-semibold text-slate-400">
          {WEEKDAYS.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const dayKey = localKey(day);
            const items = shiftsByDate.get(dayKey) ?? [];
            const isToday = dayKey === todayKey;
            return (
              <div
                key={dayKey}
                className={cn(
                  "min-h-23 space-y-1 rounded-xl border p-1.5",
                  isToday ? "border-brand-300 bg-brand-50/40" : "border-slate-100",
                  day.getMonth() !== month && "opacity-40"
                )}
              >
                <p className={cn("text-right text-xs font-bold", isToday ? "text-brand-600" : "text-slate-600")}>{day.getDate()}</p>
                {items.slice(0, 3).map((shift) => (
                  <ShiftChip key={shift.assignmentId} shift={shift} isToday={isToday} compact />
                ))}
                {items.length > 3 && <p className="text-[10px] font-semibold text-slate-400">+{items.length - 3} ca</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
