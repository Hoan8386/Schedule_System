"use client";

import React, { useMemo, useState } from "react";
import { ArrowLeftRight, CalendarRange, Calendar as CalendarIcon, CalendarX, ChevronLeft, ChevronRight, Layers, Plus } from "lucide-react";
import { Alert, Button, Card, CardHeader, EmptyState, Spinner } from "@/components/ui";
import { employeeApi, statisticsApi, type MyOpenShift, type StatShift } from "@/lib/api";
import { localKey, pad } from "@/lib/format";
import { cn } from "@/lib/cn";
import { MONTH_HEADER, WEEKDAY_SHORT } from "@/features/management/lich/constants";
import { REQUEST_TYPE_LABEL } from "@/features/statistics/dashboard";
import { useKeyedLoad, useStatData } from "@/features/statistics/useStatistics";
import { WORK_STATUS, formatHours, formatVnd } from "@/features/statistics/utils";
import { isRegistered } from "./dang-ky-ca/model";

interface EmployeeSchedulePageProps {
  onOpenRegister: () => void;
  onOpenSwap: () => void;
  onOpenCancel: () => void;
}

type ViewMode = "week" | "month";
type StatusFilter = "all" | "confirmed" | "pending" | "changing" | "done" | "absent" | "open";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "confirmed", label: "Đã xác nhận (sắp tới)" },
  { value: "pending", label: "Chờ duyệt đăng ký" },
  { value: "changing", label: "Chờ đổi / hủy" },
  { value: "done", label: "Đã hoàn thành" },
  { value: "absent", label: "Vắng mặt" },
  { value: "open", label: "Ca nhóm còn mở đăng ký" },
];

const controlClass =
  "rounded-xl border border-slate-200 bg-surface px-3 py-2 text-xs font-medium text-slate-700 outline-hidden hover:border-slate-300";

const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
const startOfWeek = (date: Date) => addDays(date, -((date.getDay() + 6) % 7));

/** Ngày đầu / cuối của khung đang xem (tuần: T2–CN; tháng: 6 tuần chứa tháng như lịch của quản lý). */
function visibleRange(anchor: Date, view: ViewMode) {
  if (view === "week") {
    const start = startOfWeek(anchor);
    return { start, end: addDays(start, 6) };
  }
  const start = startOfWeek(new Date(anchor.getFullYear(), anchor.getMonth(), 1));
  return { start, end: addDays(start, 41) };
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
    case "open":
      return false;
    default:
      return shift.workStatus !== "CANCELLED";
  }
}

function rangeTitle(start: Date, end: Date, view: ViewMode, anchor: Date) {
  if (view === "month") return `Tháng ${anchor.getMonth() + 1}, ${anchor.getFullYear()}`;
  return `${pad(start.getDate())}/${pad(start.getMonth() + 1)} – ${pad(end.getDate())}/${pad(end.getMonth() + 1)}/${end.getFullYear()}`;
}

/** Lịch làm việc của nhân viên theo tuần / tháng (cùng kiểu thời khóa biểu của quản lý). */
export default function EmployeeSchedulePage({ onOpenRegister, onOpenSwap, onOpenCancel }: EmployeeSchedulePageProps) {
  const [view, setView] = useState<ViewMode>("week");
  const [anchor, setAnchor] = useState(() => new Date());
  const [storeId, setStoreId] = useState<number | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const { start, end } = visibleRange(anchor, view);
  const from = localKey(start);
  const to = localKey(end);
  const { data, loading, error } = useStatData(statisticsApi.getMine, { from, to, storeId });
  // Nhóm ca của nhân viên + ca theo ngày của nhóm đang mở đăng ký trong khung đang xem
  const groupResult = useKeyedLoad(`${from}|${to}`, () => employeeApi.getMyShiftGroups({ from, to }), "Không thể tải nhóm ca");
  const myGroups = useMemo(() => groupResult.data?.groups ?? [], [groupResult.data]);

  // Khung ca mẫu của nhóm: luôn là các hàng của thời khóa biểu tuần
  const templates = useMemo<ShiftTemplate[]>(() => {
    const map = new Map<string, ShiftTemplate>();
    myGroups.forEach((group) =>
      group.shifts.forEach((shift) => {
        const key = slotKey(shift.startTime, shift.shiftName);
        if (!map.has(key)) map.set(key, { key, name: shift.shiftName ?? "Ca", start: shift.startTime, end: shift.endTime });
      })
    );
    return [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
  }, [myGroups]);

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

  // Ca của nhóm còn mở mà nhân viên chưa đăng ký
  const selectedStoreName = data?.stores.find((store) => store.storeId === storeId)?.storeName;
  const openShifts = useMemo(
    () =>
      (statusFilter === "all" || statusFilter === "open" ? groupResult.data?.openShifts ?? [] : []).filter(
        (item) => item.status === "OPEN" && !isRegistered(item) && (!storeId || item.storeName === selectedStoreName)
      ),
    [groupResult.data, statusFilter, storeId, selectedStoreName]
  );
  const openByDate = useMemo(() => {
    const map = new Map<string, MyOpenShift[]>();
    openShifts.forEach((item) => map.set(item.workDate, [...(map.get(item.workDate) ?? []), item]));
    return map;
  }, [openShifts]);

  // Tổng của khung đang xem (bỏ ca đã hủy)
  const totals = shifts.reduce(
    (sum, shift) => ({ count: sum.count + 1, hours: sum.hours + plannedHours(shift), wage: sum.wage + expectedWage(shift) }),
    { count: 0, hours: 0, wage: 0 }
  );
  const pendingCount = shifts.filter((shift) => shift.workStatus === "PENDING" || shift.pendingRequestType).length;

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
  const isEmpty = !loading && shifts.length === 0 && openShifts.length === 0;

  return (
    <div className="page">
      <section className="card p-4 sm:p-5">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <div className="flex items-center gap-2">
                <CalendarRange className="h-5 w-5 text-brand-500" />
                <h1 className="text-xl font-black tracking-tight text-slate-900">Thời khóa biểu của tôi</h1>
              </div>
              <p className="mt-1 text-xs text-slate-500">Ca đã được phân và ca của nhóm còn mở đăng ký. Bấm vào ca đang mở để đăng ký.</p>
            </div>
            <Button icon={Plus} onClick={onOpenRegister}>
              Đăng ký ca
            </Button>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <label className="flex flex-col gap-1 text-[11px] font-semibold text-slate-500">
              Cửa hàng
              <select
                value={storeId ?? ""}
                onChange={(event) => setStoreId(event.target.value ? Number(event.target.value) : undefined)}
                className={cn(controlClass, "min-w-44")}
              >
                <option value="">Tất cả cửa hàng</option>
                {(data?.stores ?? []).map((store) => (
                  <option key={store.storeId} value={store.storeId}>{store.storeName}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-[11px] font-semibold text-slate-500">
              Trạng thái ca
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} className={cn(controlClass, "min-w-48")}>
                {STATUS_FILTERS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </label>
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 p-1 lg:ml-auto">
              {(["week", "month"] as ViewMode[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setView(option)}
                  className={cn(
                    "rounded-lg px-4 py-2 text-xs font-bold transition",
                    view === option ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  {option === "week" ? "Tuần" : "Tháng"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 py-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label={view === "month" ? "Tháng trước" : "Tuần trước"}
              className="btn-icon border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label={view === "month" ? "Tháng sau" : "Tuần sau"}
              className="btn-icon border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <h2 className="ml-1 text-base font-black text-slate-800">{rangeTitle(start, end, view, anchor)}</h2>
            <button type="button" onClick={() => setAnchor(new Date())} className="btn btn-secondary btn-sm">
              Hôm nay
            </button>
            {(loading || groupResult.loading) && <Spinner />}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-700">{totals.count} ca</span>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 font-bold text-blue-700">{formatHours(totals.hours)}</span>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-bold text-emerald-700">Dự kiến {formatVnd(totals.wage)}</span>
            {pendingCount > 0 && <span className="rounded-full bg-brand-50 px-2.5 py-1 font-bold text-brand-700">{pendingCount} chờ duyệt</span>}
            {openShifts.length > 0 && (
              <span className="rounded-full border border-dashed border-brand-300 px-2.5 py-1 font-bold text-brand-700">{openShifts.length} ca nhóm còn mở</span>
            )}
          </div>
        </div>

        {error && <Alert className="mt-4">{error}</Alert>}

        {view === "week" ? (
          <WeekView
            days={days}
            templates={templates}
            shiftsByDate={shiftsByDate}
            openByDate={openByDate}
            todayKey={todayKey}
            onOpenRegister={onOpenRegister}
          />
        ) : (
          <MonthView
            days={days}
            month={anchor.getMonth()}
            shiftsByDate={shiftsByDate}
            openByDate={openByDate}
            todayKey={todayKey}
            onOpenRegister={onOpenRegister}
          />
        )}

        {isEmpty && (
          <p className="mt-3 text-center text-xs text-slate-400">
            Không có ca nào trong {view === "month" ? "tháng" : "tuần"} này{statusFilter !== "all" || storeId ? " với bộ lọc hiện tại" : ""}.
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-500">
          {(["UPCOMING", "PENDING", "COMPLETED", "ABSENT"] as const).map((status) => (
            <span key={status} className={cn("rounded-md border px-2 py-1", CARD_TONE[status])}>
              {WORK_STATUS[status].label}
            </span>
          ))}
          <span className="rounded-md border border-dashed border-brand-300 px-2 py-1 text-brand-700">Ca nhóm còn mở đăng ký</span>
          <span className="ml-auto">Ca vẫn có hiệu lực cho đến khi yêu cầu đổi / hủy được duyệt</span>
        </div>
      </section>

      <Card>
        <CardHeader
          title="Ca của nhóm bạn"
          icon={Layers}
          actions={
            <button onClick={onOpenRegister} className="text-[11px] font-bold text-brand-600 hover:underline">
              Đăng ký ca của nhóm
            </button>
          }
        />
        <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2">
          {groupResult.error && <Alert className="md:col-span-2">{groupResult.error}</Alert>}
          {!groupResult.loading && !groupResult.error && myGroups.length === 0 && (
            <EmptyState className="md:col-span-2">Bạn chưa được gán vào nhóm ca nào. Liên hệ trưởng cửa hàng để được xếp nhóm.</EmptyState>
          )}
          {myGroups.map((group) => (
            <div key={group.shiftGroupId} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs">
              <p className="font-bold text-slate-800">
                {group.shiftGroupName ?? `Nhóm #${group.shiftGroupId}`}
                <span className="font-normal text-slate-400"> · {group.storeName ?? "—"}</span>
              </p>
              {group.description && <p className="mt-0.5 text-[11px] text-slate-500">{group.description}</p>}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {group.shifts.length === 0 && <span className="text-slate-400">Nhóm chưa có ca mẫu</span>}
                {group.shifts.map((shift) => (
                  <span key={shift.shiftId} className="rounded-lg border border-brand-200 bg-surface px-2 py-1 font-semibold text-brand-800">
                    {shift.shiftName} · {shift.startTime} – {shift.endTime}
                  </span>
                ))}
              </div>
            </div>
          ))}
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
                {timeLabel(spotlight.startTime, spotlight.endTime)} · {formatHours(plannedHours(spotlight))} · {formatVnd(expectedWage(spotlight))}
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

// ------------------------------------------------------------------ Dùng chung cho 2 chế độ xem

/** Một khung ca trên thời khóa biểu (ca mẫu của nhóm hoặc ca xuất hiện trong khung đang xem). */
interface ShiftTemplate {
  key: string;
  name: string;
  start: string | null;
  end: string | null;
}

const slotKey = (start: string | null | undefined, name: string | null | undefined) => `${start ?? ""}|${name ?? ""}`;

const timeLabel = (start: string | null, end: string | null) => `${start ?? "--:--"} – ${end ?? "--:--"}`;

/** Màu thẻ ca theo trạng thái (cùng tông với thời khóa biểu của quản lý). */
const CARD_TONE: Record<string, string> = {
  UPCOMING: "border-slate-200 bg-white",
  IN_PROGRESS: "border-blue-200 bg-blue-50/70",
  PENDING: "border-brand-200 bg-brand-50/70",
  COMPLETED: "border-emerald-200 bg-emerald-50/70",
  ABSENT: "border-rose-200 bg-rose-50",
  CANCELLED: "border-slate-200 bg-slate-100 line-through opacity-70",
};

const cardTone = (shift: StatShift) => (shift.pendingRequestType ? CARD_TONE.PENDING : CARD_TONE[shift.workStatus] ?? CARD_TONE.UPCOMING);

const BADGE_TONE: Record<string, string> = {
  success: "bg-emerald-100 text-emerald-700",
  info: "bg-blue-100 text-blue-700",
  danger: "bg-rose-100 text-rose-700",
  neutral: "bg-slate-200 text-slate-600",
  warning: "bg-brand-100 text-brand-700",
};

/** Thẻ ca đã được phân / đăng ký. */
function ShiftCard({ shift, compact = false }: { shift: StatShift; compact?: boolean }) {
  const meta = WORK_STATUS[shift.workStatus] ?? WORK_STATUS.UPCOMING;
  const label = shift.pendingRequestType ? `Chờ ${(REQUEST_TYPE_LABEL[shift.pendingRequestType] ?? "thay đổi").toLowerCase()}` : meta.label;
  const badge = shift.pendingRequestType ? BADGE_TONE.warning : BADGE_TONE[meta.tone];

  if (compact) {
    return (
      <div
        title={`${shift.shiftName ?? "Ca"} · ${timeLabel(shift.startTime, shift.endTime)} · ${shift.storeName ?? ""} · ${label}`}
        className={cn("rounded-md border px-1.5 py-1", cardTone(shift))}
      >
        <div className="flex items-center justify-between gap-1">
          <span className="truncate text-[10px] font-bold text-slate-800">
            {shift.startTime ?? "--:--"}–{shift.endTime ?? "--:--"}
          </span>
          <span className={cn("shrink-0 rounded px-1 text-[8px] font-bold", badge)}>{label}</span>
        </div>
        <p className="truncate text-[9px] text-slate-500">{shift.shiftName ?? "Ca làm"}</p>
      </div>
    );
  }
  return (
    <div className={cn("rounded-lg border p-2 shadow-xs", cardTone(shift))}>
      <p className="truncate text-[10px] font-black text-slate-800">{shift.shiftName ?? "Ca làm"}</p>
      <p className="mt-0.5 text-[10px] font-bold text-slate-600">{timeLabel(shift.startTime, shift.endTime)}</p>
      <p className="mt-0.5 truncate text-[9px] text-slate-500">{shift.storeName ?? "—"}</p>
      <div className="mt-1.5 flex items-center justify-between gap-1">
        <span className="text-[10px] font-bold text-slate-600">{formatHours(plannedHours(shift))}</span>
        <span className={cn("rounded px-1 py-0.5 text-[8px] font-bold", badge)}>{label}</span>
      </div>
    </div>
  );
}

/** Ca của nhóm còn mở đăng ký (nhân viên chưa đăng ký) – bấm để sang trang đăng ký ca. */
function OpenCard({ shift, compact = false, onClick }: { shift: MyOpenShift; compact?: boolean; onClick: () => void }) {
  const full = Boolean(shift.maxCapacity && shift.registeredCount >= shift.maxCapacity);
  const count = `${shift.registeredCount}${shift.maxCapacity ? `/${shift.maxCapacity}` : ""}`;
  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={`${shift.shiftName ?? "Ca"} · ${timeLabel(shift.startTime, shift.endTime)} · còn mở đăng ký`}
        className="block w-full rounded-md border border-dashed border-brand-300 px-1.5 py-1 text-left transition hover:bg-brand-50"
      >
        <div className="flex items-center justify-between gap-1">
          <span className="truncate text-[10px] font-bold text-brand-800">
            {shift.startTime ?? "--:--"}–{shift.endTime ?? "--:--"}
          </span>
          <span className="shrink-0 text-[9px] font-bold text-brand-700">{count}</span>
        </div>
        <p className="truncate text-[9px] text-slate-500">{shift.shiftName ?? "Ca làm"} · còn mở</p>
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full rounded-lg border border-dashed border-brand-300 p-2 text-left transition hover:border-brand-400 hover:bg-brand-50"
    >
      <p className="truncate text-[10px] font-black text-brand-800">{shift.shiftName ?? "Ca làm"}</p>
      <p className="mt-0.5 text-[10px] font-bold text-slate-600">{timeLabel(shift.startTime, shift.endTime)}</p>
      <p className="mt-0.5 truncate text-[9px] text-slate-500">{shift.shiftGroupName ?? shift.storeName ?? ""}</p>
      <div className="mt-1.5 flex items-center justify-between gap-1">
        <span className="text-[10px] font-bold text-brand-700">{count} NV</span>
        <span className={cn("rounded px-1 py-0.5 text-[8px] font-bold", full ? BADGE_TONE.neutral : BADGE_TONE.warning)}>
          {full ? "Hết chỗ" : "Còn mở"}
        </span>
      </div>
    </button>
  );
}

// ------------------------------------------------------------------ Tuần

const GRID = "grid grid-cols-[6.5rem_repeat(7,minmax(0,1fr))]";

function WeekView({
  days,
  templates,
  shiftsByDate,
  openByDate,
  todayKey,
  onOpenRegister,
}: {
  days: Date[];
  templates: ShiftTemplate[];
  shiftsByDate: Map<string, StatShift[]>;
  openByDate: Map<string, MyOpenShift[]>;
  todayKey: string;
  onOpenRegister: () => void;
}) {
  // Mỗi hàng là một khung ca: luôn có các ca mẫu của nhóm, cộng thêm ca thực tế khác xuất hiện trong tuần
  const slots = useMemo(() => {
    const map = new Map<string, ShiftTemplate>(templates.map((template) => [template.key, template]));
    days.forEach((day) =>
      [...(shiftsByDate.get(localKey(day)) ?? []), ...(openByDate.get(localKey(day)) ?? [])].forEach((shift) => {
        const key = slotKey(shift.startTime, shift.shiftName);
        if (!map.has(key)) map.set(key, { key, name: shift.shiftName ?? "Ca", start: shift.startTime, end: shift.endTime });
      })
    );
    return [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
  }, [days, templates, shiftsByDate, openByDate]);

  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
      <div className="min-w-220">
        <div className={cn(GRID, "border-b border-slate-200 bg-slate-50")}>
          <div className="border-r border-slate-200 p-3 text-center text-[10px] font-bold text-slate-500">Khung ca</div>
          {days.map((day, index) => {
            const isToday = localKey(day) === todayKey;
            const weekend = day.getDay() === 0 || day.getDay() === 6;
            return (
              <div key={localKey(day)} className={cn("p-2 text-center", index < 6 && "border-r border-slate-200", isToday && "bg-brand-50")}>
                <p className={cn("text-[10px] font-semibold", weekend ? "text-rose-500" : "text-slate-500")}>{WEEKDAY_SHORT[day.getDay()]}</p>
                <p className={cn("mt-0.5 text-lg font-black", isToday ? "text-brand-600" : "text-slate-800")}>
                  {pad(day.getDate())}/{pad(day.getMonth() + 1)}
                </p>
              </div>
            );
          })}
        </div>

        {slots.length === 0 && (
          <div className="p-6 text-center text-xs text-slate-400">Chưa có khung ca nào. Bạn sẽ thấy ca ở đây sau khi được gán nhóm ca.</div>
        )}

        {slots.map((slot, slotIndex) => (
          <div key={slot.key} className={cn(GRID, "min-h-32", slotIndex < slots.length - 1 && "border-b border-slate-200")}>
            <div className="border-r border-slate-200 bg-slate-50/60 p-3">
              <p className="text-[11px] font-black text-slate-700">{slot.name}</p>
              <p className="mt-1 text-[10px] font-semibold text-slate-500">{timeLabel(slot.start, slot.end)}</p>
            </div>
            {days.map((day, index) => {
              const dayKey = localKey(day);
              const inSlot = (shift: { startTime: string | null; shiftName: string | null }) => slotKey(shift.startTime, shift.shiftName) === slot.key;
              const items = (shiftsByDate.get(dayKey) ?? []).filter(inSlot);
              const open = (openByDate.get(dayKey) ?? []).filter(inSlot);
              return (
                <div key={`${slot.key}-${dayKey}`} className={cn("space-y-2 p-1.5", index < 6 && "border-r border-slate-200", dayKey === todayKey && "bg-brand-50/30")}>
                  {items.map((shift) => (
                    <ShiftCard key={shift.assignmentId} shift={shift} />
                  ))}
                  {open.map((shift) => (
                    <OpenCard key={`open-${shift.shiftByDateId}`} shift={shift} onClick={onOpenRegister} />
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

// ------------------------------------------------------------------ Tháng

const MAX_VISIBLE = 3;

function MonthView({
  days,
  month,
  shiftsByDate,
  openByDate,
  todayKey,
  onOpenRegister,
}: {
  days: Date[];
  month: number;
  shiftsByDate: Map<string, StatShift[]>;
  openByDate: Map<string, MyOpenShift[]>;
  todayKey: string;
  onOpenRegister: () => void;
}) {
  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
      <div className="min-w-180">
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
          {MONTH_HEADER.map((label, index) => (
            <div key={label} className={cn("px-2 py-2 text-center text-[11px] font-bold", index >= 5 ? "text-rose-500" : "text-slate-500")}>
              {label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dayKey = localKey(day);
            const items = shiftsByDate.get(dayKey) ?? [];
            const open = openByDate.get(dayKey) ?? [];
            const total = items.length + open.length;
            const inMonth = day.getMonth() === month;
            const isToday = dayKey === todayKey;
            const visibleItems = items.slice(0, MAX_VISIBLE);
            const visibleOpen = open.slice(0, Math.max(0, MAX_VISIBLE - visibleItems.length));
            const hidden = total - visibleItems.length - visibleOpen.length;
            return (
              <div
                key={dayKey}
                className={cn(
                  "flex min-h-36 flex-col border-b border-slate-200 p-2",
                  index % 7 !== 6 && "border-r",
                  index >= 35 && "border-b-0",
                  inMonth ? "bg-white" : "bg-slate-50/70"
                )}
              >
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={cn(
                      "flex h-6 min-w-6 items-center justify-center rounded-full text-xs font-black",
                      isToday ? "bg-brand-500 text-brand-contrast" : inMonth ? "text-slate-800" : "text-slate-300"
                    )}
                  >
                    {day.getDate()}
                  </span>
                  {total > 0 && <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">{total} ca</span>}
                </div>
                <div className={cn("mt-1.5 space-y-1", !inMonth && "opacity-60")}>
                  {visibleItems.map((shift) => (
                    <ShiftCard key={shift.assignmentId} shift={shift} compact />
                  ))}
                  {visibleOpen.map((shift) => (
                    <OpenCard key={`open-${shift.shiftByDateId}`} shift={shift} compact onClick={onOpenRegister} />
                  ))}
                  {hidden > 0 && <p className="px-1.5 text-[10px] font-bold text-brand-700">+{hidden} ca khác</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
