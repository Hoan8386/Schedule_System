"use client";

import React, { useCallback, useMemo, useState } from "react";
import { CalendarRange, ChevronLeft, ChevronRight, Inbox, RefreshCw, Users } from "lucide-react";
import { Alert, Badge, Button, EmptyState, Modal, Spinner } from "@/components/ui";
import {
  storeManagerApi,
  type ApiResponse,
  type EmployeeResponse,
  type ShiftAssignmentResponse,
  type ShiftByDateResponse,
  type ShiftResponse,
  type StoreResponse,
} from "@/lib/api";
import { formatDate, formatDateTime, localKey, pad } from "@/lib/format";
import { cn } from "@/lib/cn";
import { MONTH_HEADER, WEEKDAY_SHORT } from "@/features/management/lich/constants";
import { useKeyedLoad } from "@/features/statistics/useStatistics";

type ViewMode = "week" | "month";

interface ScheduleData {
  stores: StoreResponse[];
  shifts: ShiftResponse[];
  shiftDates: ShiftByDateResponse[];
  assignments: ShiftAssignmentResponse[];
  employees: EmployeeResponse[];
}

/** Một hàng của thời khóa biểu: ca mẫu của cửa hàng */
interface Row {
  shiftId: number;
  name: string;
  start: string | null;
  end: string | null;
  groupName: string | null;
  storeName: string | null;
  maxCapacity: number | null;
}

const DEFAULT_CAPACITY = 5;
const INACTIVE = ["CANCELLED", "REJECTED"];

const ASSIGNMENT_STATUS: Record<string, { label: string; tone: "warning" | "success" | "danger" | "neutral" | "info" }> = {
  PENDING: { label: "Chờ duyệt", tone: "warning" },
  APPROVED: { label: "Đã duyệt", tone: "success" },
  COMPLETED: { label: "Đã làm", tone: "info" },
  REJECTED: { label: "Từ chối", tone: "danger" },
  CANCELLED: { label: "Đã hủy", tone: "neutral" },
};

const SHIFT_DATE_STATUS: Record<string, string> = { OPEN: "Đang mở", FULL: "Đã đủ người", CLOSED: "Đã đóng", CANCELLED: "Đã hủy" };

const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
const startOfWeek = (date: Date) => addDays(date, -((date.getDay() + 6) % 7));
const hhmm = (value?: string | null) => (value ? value.slice(0, 5) : null);
const sbdIdOf = (item: ShiftByDateResponse) => Number(item.id ?? item.shiftByDateId ?? 0);
const shiftIdOf = (item: ShiftResponse) => Number(item.id ?? item.shiftId ?? 0);

function visibleDays(anchor: Date, view: ViewMode) {
  const start = view === "week" ? startOfWeek(anchor) : startOfWeek(new Date(anchor.getFullYear(), anchor.getMonth(), 1));
  return Array.from({ length: view === "week" ? 7 : 42 }, (_, index) => addDays(start, index));
}

/** Tải song song các danh sách (backend tự giới hạn theo cửa hàng của trưởng cửa hàng). */
async function loadSchedule(from: string, to: string): Promise<ApiResponse<ScheduleData>> {
  const [stores, shifts, shiftDates, assignments, employees] = await Promise.all([
    storeManagerApi.getStores(),
    storeManagerApi.getShifts(),
    storeManagerApi.getShiftsByDate({ from, to }),
    storeManagerApi.getShiftAssignments(),
    storeManagerApi.getEmployees(),
  ]);
  return {
    statusCode: 200,
    message: "",
    data: {
      stores: stores.data ?? [],
      shifts: shifts.data ?? [],
      shiftDates: shiftDates.data ?? [],
      assignments: assignments.data ?? [],
      employees: employees.data ?? [],
    },
  };
}

/** Thời khóa biểu ca của cửa hàng; bấm vào ca để xem danh sách nhân viên đã đăng ký. */
export default function StoreManagerSchedulePage({ onGoToRequests }: { onGoToRequests?: () => void }) {
  const [view, setView] = useState<ViewMode>("week");
  const [anchor, setAnchor] = useState(() => new Date());
  const [storeId, setStoreId] = useState("");
  const [version, setVersion] = useState(0);
  const [selected, setSelected] = useState<{ row: Row; dayKey: string } | null>(null);

  const days = visibleDays(anchor, view);
  const from = localKey(days[0]);
  const to = localKey(days[days.length - 1]);
  const { data, loading, error } = useKeyedLoad(`${from}|${to}|${version}`, () => loadSchedule(from, to), "Không thể tải lịch cửa hàng");

  const employeeById = useMemo(() => new Map((data?.employees ?? []).map((item) => [Number(item.id), item])), [data]);
  const assignmentsBySbd = useMemo(() => {
    const map = new Map<number, ShiftAssignmentResponse[]>();
    (data?.assignments ?? []).forEach((item) => {
      const sbdId = Number(item.shiftByDateId ?? 0);
      map.set(sbdId, [...(map.get(sbdId) ?? []), item]);
    });
    return map;
  }, [data]);
  const sbdByKey = useMemo(() => {
    const map = new Map<string, ShiftByDateResponse>();
    (data?.shiftDates ?? []).forEach((item) => {
      if (storeId && Number(item.storeId) !== Number(storeId)) return;
      map.set(`${item.shiftId}|${String(item.workDate ?? "").slice(0, 10)}`, item);
    });
    return map;
  }, [data, storeId]);

  // Hàng = ca mẫu đang hoạt động của cửa hàng (kèm ca mẫu có ca theo ngày trong khung đang xem)
  const rows = useMemo<Row[]>(() => {
    const usedShiftIds = new Set((data?.shiftDates ?? []).map((item) => Number(item.shiftId)));
    return (data?.shifts ?? [])
      .filter((shift) => (!storeId || Number(shift.storeId) === Number(storeId)) && (shift.status === "ACTIVE" || usedShiftIds.has(shiftIdOf(shift))))
      .map((shift) => ({
        shiftId: shiftIdOf(shift),
        name: shift.shiftName ?? "Ca",
        start: hhmm(shift.startTime),
        end: hhmm(shift.endTime),
        groupName: shift.shiftGroupName ?? null,
        storeName: shift.storeName ?? null,
        maxCapacity: shift.maxCapacity ?? null,
      }))
      .sort((a, b) => `${a.start}${a.name}`.localeCompare(`${b.start}${b.name}`));
  }, [data, storeId]);

  const activeOf = useCallback(
    (sbd?: ShiftByDateResponse) =>
      sbd ? (assignmentsBySbd.get(sbdIdOf(sbd)) ?? []).filter((item) => !INACTIVE.includes(String(item.status).toUpperCase())) : [],
    [assignmentsBySbd]
  );

  const todayKey = localKey(new Date());
  const move = (direction: -1 | 1) =>
    setAnchor((current) => (view === "week" ? addDays(current, direction * 7) : new Date(current.getFullYear(), current.getMonth() + direction, 1)));
  const title =
    view === "month"
      ? `Tháng ${anchor.getMonth() + 1}, ${anchor.getFullYear()}`
      : `${pad(days[0].getDate())}/${pad(days[0].getMonth() + 1)} – ${pad(days[6].getDate())}/${pad(days[6].getMonth() + 1)}/${days[6].getFullYear()}`;

  // Thống kê khung đang xem
  const visibleSbd = [...sbdByKey.values()];
  const stats = visibleSbd.reduce<{ shifts: number; registered: number; pending: number; missing: number }>(
    (sum, sbd) => {
      const active = activeOf(sbd);
      return {
        shifts: sum.shifts + 1,
        registered: sum.registered + active.length,
        pending: sum.pending + active.filter((item) => String(item.status).toUpperCase() === "PENDING").length,
        missing: sum.missing + (active.length === 0 ? 1 : 0),
      };
    },
    { shifts: 0, registered: 0, pending: 0, missing: 0 }
  );

  const stores = data?.stores ?? [];

  return (
    <div className="page">
      <section className="card p-4 sm:p-5">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <div className="flex items-center gap-2">
                <CalendarRange className="h-5 w-5 text-brand-500" />
                <h1 className="text-xl font-black tracking-tight text-slate-900">Lịch làm việc của cửa hàng</h1>
              </div>
              <p className="mt-1 text-xs text-slate-500">Bấm vào một ca để xem chính xác nhân viên nào đã đăng ký.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setVersion((value) => value + 1)} disabled={loading}>
                <RefreshCw className={loading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
                Làm mới
              </Button>
              {onGoToRequests && (
                <Button icon={Inbox} onClick={onGoToRequests}>
                  Xử lý yêu cầu ca
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            {stores.length > 1 && (
              <label className="flex flex-col gap-1 text-[11px] font-semibold text-slate-500">
                Cửa hàng
                <select
                  value={storeId}
                  onChange={(event) => setStoreId(event.target.value)}
                  className="min-w-44 rounded-xl border border-slate-200 bg-surface px-3 py-2 text-xs font-medium text-slate-700 outline-hidden"
                >
                  <option value="">Tất cả cửa hàng ({stores.length})</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>{store.storeName}</option>
                  ))}
                </select>
              </label>
            )}
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 p-1 lg:ml-auto">
              {(["week", "month"] as ViewMode[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setView(option)}
                  className={cn("rounded-lg px-4 py-2 text-xs font-bold transition", view === option ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50")}
                >
                  {option === "week" ? "Tuần" : "Tháng"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 py-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => move(-1)} aria-label="Trước" className="btn-icon border border-slate-200 text-slate-600 hover:bg-slate-50">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => move(1)} aria-label="Sau" className="btn-icon border border-slate-200 text-slate-600 hover:bg-slate-50">
              <ChevronRight className="h-4 w-4" />
            </button>
            <h2 className="ml-1 text-base font-black text-slate-800">{title}</h2>
            <button type="button" onClick={() => setAnchor(new Date())} className="btn btn-secondary btn-sm">
              Hôm nay
            </button>
            {loading && <Spinner />}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-700">{stats.shifts} ca</span>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-bold text-emerald-700">{stats.registered} lượt đăng ký</span>
            {stats.pending > 0 && <span className="rounded-full bg-brand-50 px-2.5 py-1 font-bold text-brand-700">{stats.pending} chờ duyệt</span>}
            {stats.missing > 0 && <span className="rounded-full bg-rose-50 px-2.5 py-1 font-bold text-rose-700">{stats.missing} ca chưa có người</span>}
          </div>
        </div>

        {error && <Alert className="mt-4">{error}</Alert>}

        {!data && loading ? (
          <Spinner label="Đang tải lịch..." className="mt-4 h-64 rounded-xl border border-dashed border-slate-200" />
        ) : rows.length === 0 ? (
          <EmptyState className="mt-4">Cửa hàng chưa có ca mẫu nào.</EmptyState>
        ) : view === "week" ? (
          <WeekGrid days={days} rows={rows} todayKey={todayKey} sbdByKey={sbdByKey} activeOf={activeOf} onOpen={(row, dayKey) => setSelected({ row, dayKey })} />
        ) : (
          <MonthGrid
            days={days}
            month={anchor.getMonth()}
            rows={rows}
            todayKey={todayKey}
            sbdByKey={sbdByKey}
            activeOf={activeOf}
            onOpen={(row, dayKey) => setSelected({ row, dayKey })}
          />
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-500">
          <span className="rounded-md border border-emerald-200 bg-emerald-50/70 px-2 py-1">Có người đăng ký</span>
          <span className="rounded-md border border-blue-200 bg-blue-50/70 px-2 py-1">Đã đủ người</span>
          <span className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1">Mở nhưng chưa có ai</span>
          <span className="rounded-md border border-dashed border-slate-200 px-2 py-1">Chưa có ca theo ngày</span>
          <span className="ml-auto">Số trên ca = nhân viên đã đăng ký / sức chứa</span>
        </div>
      </section>

      {selected && (
        <ShiftDetailModal
          row={selected.row}
          dayKey={selected.dayKey}
          sbd={sbdByKey.get(`${selected.row.shiftId}|${selected.dayKey}`)}
          assignments={(() => {
            const sbd = sbdByKey.get(`${selected.row.shiftId}|${selected.dayKey}`);
            return sbd ? assignmentsBySbd.get(sbdIdOf(sbd)) ?? [] : [];
          })()}
          employeeById={employeeById}
          onClose={() => setSelected(null)}
          onGoToRequests={onGoToRequests}
        />
      )}
    </div>
  );
}

// ------------------------------------------------------------------ Ô ca

interface CellProps {
  row: Row;
  sbd?: ShiftByDateResponse;
  activeCount: number;
  compact?: boolean;
  onOpen: () => void;
}

function cellTone(sbd: ShiftByDateResponse | undefined, count: number, capacity: number) {
  if (!sbd) return "border-dashed border-slate-200 bg-white text-slate-400";
  if (sbd.status === "CANCELLED" || sbd.status === "CLOSED") return "border-slate-200 bg-slate-100 text-slate-500";
  if (count >= capacity) return "border-blue-200 bg-blue-50/70";
  if (count === 0) return "border-rose-200 bg-rose-50";
  return "border-emerald-200 bg-emerald-50/70";
}

function ShiftCell({ row, sbd, activeCount, compact = false, onOpen }: CellProps) {
  const capacity = Number(sbd?.maxCapacity || row.maxCapacity || DEFAULT_CAPACITY);
  const tone = cellTone(sbd, activeCount, capacity);
  const statusLabel = sbd ? SHIFT_DATE_STATUS[String(sbd.status).toUpperCase()] ?? sbd.status : "Chưa có ca";
  if (compact) {
    return (
      <button
        type="button"
        onClick={onOpen}
        title={`${row.name} ${row.start}–${row.end} · ${activeCount}/${capacity} · ${statusLabel}`}
        className={cn("flex w-full items-center justify-between gap-1 rounded-md border px-1.5 py-1 text-left transition hover:border-brand-400", tone)}
      >
        <span className="truncate text-[10px] font-bold text-slate-800">
          {row.start}–{row.end} {row.name}
        </span>
        <span className="shrink-0 text-[10px] font-black text-slate-700">
          {activeCount}/{capacity}
        </span>
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn("flex h-full w-full flex-col justify-between rounded-lg border p-2 text-left shadow-xs transition hover:border-brand-400 hover:shadow-sm", tone)}
    >
      <span className="text-lg font-black leading-none text-slate-800">
        {activeCount}/{capacity}
      </span>
      <span className="mt-1 text-[10px] font-semibold">{statusLabel}</span>
    </button>
  );
}

interface GridProps {
  days: Date[];
  rows: Row[];
  todayKey: string;
  sbdByKey: Map<string, ShiftByDateResponse>;
  activeOf: (sbd?: ShiftByDateResponse) => ShiftAssignmentResponse[];
  onOpen: (row: Row, dayKey: string) => void;
}

const GRID = "grid grid-cols-[9rem_repeat(7,minmax(0,1fr))]";

function WeekGrid({ days, rows, todayKey, sbdByKey, activeOf, onOpen }: GridProps) {
  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
      <div className="min-w-220">
        <div className={cn(GRID, "border-b border-slate-200 bg-slate-50")}>
          <div className="border-r border-slate-200 p-3 text-center text-[10px] font-bold text-slate-500">Khung ca</div>
          {days.map((day, index) => {
            const key = localKey(day);
            const weekend = day.getDay() === 0 || day.getDay() === 6;
            return (
              <div key={key} className={cn("p-2 text-center", index < 6 && "border-r border-slate-200", key === todayKey && "bg-brand-50")}>
                <p className={cn("text-[10px] font-semibold", weekend ? "text-rose-500" : "text-slate-500")}>{WEEKDAY_SHORT[day.getDay()]}</p>
                <p className={cn("mt-0.5 text-lg font-black", key === todayKey ? "text-brand-600" : "text-slate-800")}>
                  {pad(day.getDate())}/{pad(day.getMonth() + 1)}
                </p>
              </div>
            );
          })}
        </div>
        {rows.map((row, rowIndex) => (
          <div key={row.shiftId} className={cn(GRID, "min-h-24", rowIndex < rows.length - 1 && "border-b border-slate-200")}>
            <div className="border-r border-slate-200 bg-slate-50/60 p-3">
              <p className="text-[11px] font-black text-slate-700">{row.name}</p>
              <p className="mt-1 text-[10px] font-semibold text-slate-500">
                {row.start} – {row.end}
              </p>
              {row.groupName && <p className="mt-1 truncate text-[9px] text-slate-400">{row.groupName}</p>}
            </div>
            {days.map((day, index) => {
              const key = localKey(day);
              const sbd = sbdByKey.get(`${row.shiftId}|${key}`);
              return (
                <div key={key} className={cn("p-1.5", index < 6 && "border-r border-slate-200", key === todayKey && "bg-brand-50/30")}>
                  <ShiftCell row={row} sbd={sbd} activeCount={activeOf(sbd).length} onOpen={() => onOpen(row, key)} />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthGrid({ days, month, rows, todayKey, sbdByKey, activeOf, onOpen }: GridProps & { month: number }) {
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
            const key = localKey(day);
            const inMonth = day.getMonth() === month;
            const dayRows = rows.filter((row) => sbdByKey.has(`${row.shiftId}|${key}`));
            return (
              <div
                key={key}
                className={cn(
                  "flex min-h-32 flex-col border-b border-slate-200 p-2",
                  index % 7 !== 6 && "border-r",
                  index >= 35 && "border-b-0",
                  inMonth ? "bg-white" : "bg-slate-50/70"
                )}
              >
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={cn(
                      "flex h-6 min-w-6 items-center justify-center rounded-full text-xs font-black",
                      key === todayKey ? "bg-brand-500 text-brand-contrast" : inMonth ? "text-slate-800" : "text-slate-300"
                    )}
                  >
                    {day.getDate()}
                  </span>
                  {dayRows.length > 0 && <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">{dayRows.length} ca</span>}
                </div>
                <div className={cn("mt-1.5 space-y-1", !inMonth && "opacity-60")}>
                  {dayRows.map((row) => {
                    const sbd = sbdByKey.get(`${row.shiftId}|${key}`);
                    return <ShiftCell key={row.shiftId} row={row} sbd={sbd} activeCount={activeOf(sbd).length} compact onOpen={() => onOpen(row, key)} />;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ Chi tiết ca: danh sách nhân viên đã đăng ký

interface DetailProps {
  row: Row;
  dayKey: string;
  sbd?: ShiftByDateResponse;
  assignments: ShiftAssignmentResponse[];
  employeeById: Map<number, EmployeeResponse>;
  onClose: () => void;
  onGoToRequests?: () => void;
}

function ShiftDetailModal({ row, dayKey, sbd, assignments, employeeById, onClose, onGoToRequests }: DetailProps) {
  const active = assignments.filter((item) => !INACTIVE.includes(String(item.status).toUpperCase()));
  const inactive = assignments.filter((item) => INACTIVE.includes(String(item.status).toUpperCase()));
  const capacity = Number(sbd?.maxCapacity || row.maxCapacity || DEFAULT_CAPACITY);
  const weekday = new Date(`${dayKey}T00:00:00`).toLocaleDateString("vi-VN", { weekday: "long" });
  const sorted = [...active, ...inactive];

  return (
    <Modal
      open
      size="max-w-2xl"
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <Users className="h-5 w-5 text-brand-600" />
          {row.name} · {row.start} – {row.end}
        </span>
      }
      footer={
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          {onGoToRequests && active.some((item) => String(item.status).toUpperCase() === "PENDING") && (
            <Button
              variant="secondary"
              icon={Inbox}
              onClick={() => {
                onClose();
                onGoToRequests();
              }}
            >
              Duyệt đăng ký
            </Button>
          )}
          <Button onClick={onClose}>Đóng</Button>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
        <Info label="Ngày làm" value={`${formatDate(dayKey)}`} hint={weekday} />
        <Info label="Cửa hàng" value={sbd?.storeName ?? row.storeName ?? "—"} hint={row.groupName ?? undefined} />
        <Info label="Đã đăng ký" value={`${active.length}/${capacity}`} hint={active.length >= capacity ? "Đã đủ người" : `Còn ${capacity - active.length} chỗ`} />
        <Info
          label="Trạng thái ca"
          value={sbd ? SHIFT_DATE_STATUS[String(sbd.status).toUpperCase()] ?? String(sbd.status) : "Chưa có ca theo ngày"}
          hint={sbd?.sessionName ?? sbd?.roundName ?? undefined}
        />
      </div>

      {!sbd ? (
        <EmptyState>Ngày này chưa có ca theo ngày nên chưa có ai đăng ký.</EmptyState>
      ) : sorted.length === 0 ? (
        <EmptyState>Chưa có nhân viên nào đăng ký ca này.</EmptyState>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-400">
                <th className="px-4 py-2.5">#</th>
                <th className="px-4 py-2.5">Nhân viên</th>
                <th className="px-4 py-2.5">Liên hệ</th>
                <th className="px-4 py-2.5">Đăng ký lúc</th>
                <th className="px-4 py-2.5 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {sorted.map((item, index) => {
                const employee = employeeById.get(Number(item.employeeId));
                const status = ASSIGNMENT_STATUS[String(item.status).toUpperCase()] ?? { label: String(item.status), tone: "neutral" as const };
                const inactiveRow = INACTIVE.includes(String(item.status).toUpperCase());
                return (
                  <tr key={Number(item.id ?? item.shiftAssignmentId ?? index)} className={cn(inactiveRow && "opacity-50")}>
                    <td className="px-4 py-3 text-slate-400">{index + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-800">{employee?.fullName ?? `NV #${item.employeeId}`}</p>
                      <p className="text-[10px] text-slate-400">{employee?.employeeCode ?? `#${item.employeeId}`}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{employee?.phone ?? employee?.email ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDateTime(item.registeredAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}

function Info({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <p className="text-[10px] font-semibold uppercase text-slate-400">{label}</p>
      <p className="mt-0.5 font-bold text-slate-800">{value}</p>
      {hint && <p className="mt-0.5 truncate text-[10px] capitalize text-slate-400">{hint}</p>}
    </div>
  );
}
