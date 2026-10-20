"use client";

import React from "react";
import type { MyGroupShift, MyOpenShift, MyShiftGroup, RegistrationPeriod } from "@/lib/api";
import { formatDateTime, localKey, pad } from "@/lib/format";
import { cn } from "@/lib/cn";
import { MONTH_HEADER, WEEKDAY_SHORT } from "@/features/management/lich/constants";
import { isRegistered } from "./model";

// ------------------------------------------------------------------ Trạng thái một ô (ca mẫu × ngày)

export interface TemplateRow {
  shift: MyGroupShift;
  group: MyShiftGroup;
}

/** pending: đã đăng ký, chờ quản lý duyệt; approved: quản lý đã duyệt (cả hai bỏ đăng ký được khi đợt / phiên còn mở) */
type CellKind = "pending" | "approved" | "available" | "full" | "closed" | "past" | "outside" | "window";

export interface Cell {
  kind: CellKind;
  count: number;
  capacity: number;
  /** Lý do không đăng ký được / trạng thái đăng ký */
  note: string;
  /** Còn bỏ đăng ký được (đợt / phiên đăng ký của nhóm còn mở) – xóa luôn, không cần duyệt */
  cancellable?: boolean;
  shiftByDate?: MyOpenShift;
}

/** Sức chứa mặc định khi cả ca theo ngày lẫn ca mẫu đều chưa cấu hình */
export const DEFAULT_CAPACITY = 5;

const ASSIGNMENT_LABEL: Record<string, string> = { APPROVED: "Đã duyệt", COMPLETED: "Đã làm" };

const isOpenNow = (openAt: string | null, closeAt: string | null) => {
  const now = Date.now();
  return (!openAt || new Date(openAt).getTime() <= now) && (!closeAt || new Date(closeAt).getTime() >= now);
};

/** Đợt / phiên đăng ký của nhóm trong kỳ có đang mở không (backend kiểm tra lại khi đăng ký). */
export function windowState(period: RegistrationPeriod | null, group: MyShiftGroup): { open: boolean; note: string } {
  if (!period) return { open: false, note: "Chưa chọn kỳ" };
  const rounds = period.rounds.filter((round) => !round.storeName || round.storeName === group.storeName);
  if (rounds.length === 0) return { open: false, note: "Kỳ chưa có đợt đăng ký cho cửa hàng" };
  const round = rounds.find((item) => isOpenNow(item.registrationStartAt, item.registrationEndAt)) ?? rounds[0];
  if (round.registrationStartAt && new Date(round.registrationStartAt).getTime() > Date.now()) {
    return { open: false, note: `Đợt mở lúc ${formatDateTime(round.registrationStartAt)}` };
  }
  if (round.registrationEndAt && new Date(round.registrationEndAt).getTime() < Date.now()) {
    return { open: false, note: "Đợt đăng ký đã đóng" };
  }
  if (round.sessions.length > 0) {
    const session =
      round.sessions.find((item) => item.shiftGroupId === group.shiftGroupId) ?? round.sessions.find((item) => item.shiftGroupId == null);
    if (!session) return { open: false, note: "Không có phiên cho nhóm" };
    if (String(session.status).toUpperCase() === "CLOSED") return { open: false, note: "Phiên đã đóng" };
    if (session.openAt && new Date(session.openAt).getTime() > Date.now()) {
      return { open: false, note: `Phiên mở lúc ${formatDateTime(session.openAt)}` };
    }
    if (session.closeAt && new Date(session.closeAt).getTime() < Date.now()) return { open: false, note: "Phiên đã đóng" };
  }
  return { open: true, note: "" };
}

export function cellFor(
  row: TemplateRow,
  dayKey: string,
  todayKey: string,
  inPeriod: boolean,
  window: { open: boolean; note: string },
  byKey: Map<string, MyOpenShift>
): Cell {
  const shiftByDate = byKey.get(`${row.shift.shiftId}|${dayKey}`);
  const count = shiftByDate?.registeredCount ?? 0;
  const capacity = shiftByDate?.maxCapacity || row.shift.maxCapacity || DEFAULT_CAPACITY;
  const base = { count, capacity, shiftByDate };
  if (!inPeriod) return { ...base, kind: "outside", note: "Ngoài kỳ" };
  if (shiftByDate && isRegistered(shiftByDate)) {
    const status = String(shiftByDate.myAssignmentStatus).toUpperCase();
    // Còn trong thời gian đăng ký thì bỏ đăng ký được (kể cả đã duyệt) – backend kiểm tra lại; ngày đã qua thì không
    const cancellable = window.open && dayKey >= todayKey && status !== "COMPLETED";
    if (status === "PENDING") {
      return { ...base, kind: "pending", cancellable, note: cancellable ? "Chờ duyệt" : "Chờ duyệt · hết thời gian đăng ký" };
    }
    return { ...base, kind: "approved", cancellable, note: ASSIGNMENT_LABEL[status] ?? "Đã duyệt" };
  }
  if (dayKey < todayKey) return { ...base, kind: "past", note: "Đã qua" };
  if (shiftByDate && shiftByDate.status !== "OPEN") return { ...base, kind: "closed", note: "Đã đóng" };
  if (count >= capacity) return { ...base, kind: "full", note: "Hết chỗ" };
  if (!window.open) return { ...base, kind: "window", note: window.note };
  return { ...base, kind: "available", note: "Còn chỗ" };
}

const CELL_TONE: Record<CellKind, string> = {
  pending: "border-amber-300 bg-amber-50 text-amber-800 hover:border-amber-400 hover:shadow-sm",
  approved: "border-emerald-300 bg-emerald-50 text-emerald-800 hover:border-emerald-400 hover:shadow-sm",
  available: "border-brand-200 bg-white text-slate-800 hover:border-brand-400 hover:bg-brand-50 hover:shadow-sm",
  full: "border-slate-200 bg-slate-100 text-slate-400 hover:border-slate-300",
  closed: "border-slate-200 bg-slate-100 text-slate-400 hover:border-slate-300",
  past: "border-slate-100 bg-slate-50 text-slate-300",
  outside: "border-transparent bg-transparent text-slate-300",
  window: "border-dashed border-slate-200 bg-white text-slate-400 hover:border-slate-300",
};

const countTone = (cell: Cell) =>
  cell.kind === "approved"
    ? "text-emerald-700"
    : cell.kind === "pending"
      ? "text-amber-700"
    : cell.count >= cell.capacity
      ? "text-rose-600"
      : cell.count > 0
        ? "text-blue-600"
        : "text-slate-500";

interface CellButtonProps {
  row: TemplateRow;
  cell: Cell;
  compact?: boolean;
  submitting: boolean;
  clickable: boolean;
  onRegister: () => void;
}

/** Mọi ô trong kỳ (trừ ngày đã qua) đều bấm được để mở popup; đăng ký / hủy được hay không do popup quyết định. */
export const isClickable = (cell: Cell) => cell.kind !== "outside" && cell.kind !== "past";

/** Một ô đăng ký: số người đã đăng ký / sức chứa + trạng thái; bấm để mở popup đăng ký / hủy đăng ký. */
export function CellButton({ row, cell, compact = false, submitting, clickable: canClick, onRegister }: CellButtonProps) {
  if (cell.kind === "outside") return compact ? null : <div className="h-full rounded-lg bg-slate-50/60" />;
  const clickable = canClick && !submitting;
  const capacity = cell.capacity;
  const title = `${row.shift.shiftName ?? "Ca"} ${row.shift.startTime}–${row.shift.endTime} · ${cell.count}/${capacity} người · ${cell.note}${
    clickable ? " · bấm để xem" : ""
  }`;

  if (compact) {
    return (
      <button
        type="button"
        title={title}
        disabled={!clickable}
        onClick={onRegister}
        className={cn("flex w-full items-center justify-between gap-1 rounded-md border px-1.5 py-1 text-left transition", clickable && "cursor-pointer", CELL_TONE[cell.kind])}
      >
        <span className="truncate text-[10px] font-bold">
          {row.shift.shiftName ?? "Ca"} {row.shift.startTime}
        </span>
        <span className={cn("shrink-0 text-[10px] font-black", countTone(cell))}>
          {cell.kind === "pending" ? "⏳ " : cell.kind === "approved" ? "✓ " : ""}
          {cell.count}/{capacity}
        </span>
      </button>
    );
  }
  return (
    <button
      type="button"
      title={title}
      disabled={!clickable}
      onClick={onRegister}
      className={cn("flex h-full w-full flex-col justify-between rounded-lg border p-2 text-left transition", clickable && "cursor-pointer", CELL_TONE[cell.kind])}
    >
      <span className={cn("text-lg font-black leading-none", countTone(cell))}>
        {cell.count}/{capacity}
      </span>
      <span className="mt-1 text-[10px] font-semibold">{submitting ? "Đang gửi..." : cell.kind === "approved" ? `✓ ${cell.note}` : cell.kind === "pending" ? `⏳ ${cell.note}` : cell.note}</span>
    </button>
  );
}

// ------------------------------------------------------------------ Lưới tuần: hàng = ca mẫu, cột = ngày

const GRID = "grid grid-cols-[9rem_repeat(7,minmax(0,1fr))]";

interface GridProps {
  days: Date[];
  rows: TemplateRow[];
  todayKey: string;
  inPeriod: (dayKey: string) => boolean;
  cellOf: (row: TemplateRow, dayKey: string) => Cell;
  submittingKey: string | null;
  onRegister: (row: TemplateRow, dayKey: string) => void;
}

export function RegisterWeekGrid({ days, rows, todayKey, inPeriod, cellOf, submittingKey, onRegister }: GridProps) {
  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
      <div className="min-w-220">
        <div className={cn(GRID, "border-b border-slate-200 bg-slate-50")}>
          <div className="border-r border-slate-200 p-3 text-center text-[10px] font-bold text-slate-500">Khung ca</div>
          {days.map((day, index) => {
            const key = localKey(day);
            const weekend = day.getDay() === 0 || day.getDay() === 6;
            return (
              <div
                key={key}
                className={cn(
                  "p-2 text-center",
                  index < 6 && "border-r border-slate-200",
                  key === todayKey && "bg-brand-50",
                  !inPeriod(key) && "opacity-40"
                )}
              >
                <p className={cn("text-[10px] font-semibold", weekend ? "text-rose-500" : "text-slate-500")}>{WEEKDAY_SHORT[day.getDay()]}</p>
                <p className={cn("mt-0.5 text-lg font-black", key === todayKey ? "text-brand-600" : "text-slate-800")}>
                  {pad(day.getDate())}/{pad(day.getMonth() + 1)}
                </p>
              </div>
            );
          })}
        </div>
        {rows.map((row, rowIndex) => (
          <div key={`${row.group.shiftGroupId}-${row.shift.shiftId}`} className={cn(GRID, "min-h-24", rowIndex < rows.length - 1 && "border-b border-slate-200")}>
            <div className="border-r border-slate-200 bg-slate-50/60 p-3">
              <p className="text-[11px] font-black text-slate-700">{row.shift.shiftName}</p>
              <p className="mt-1 text-[10px] font-semibold text-slate-500">
                {row.shift.startTime} – {row.shift.endTime}
              </p>
              <p className="mt-1 truncate text-[9px] text-slate-400">{row.group.shiftGroupName}</p>
            </div>
            {days.map((day, index) => {
              const key = localKey(day);
              const cellKey = `${row.shift.shiftId}|${key}`;
              return (
                <div key={key} className={cn("p-1.5", index < 6 && "border-r border-slate-200", key === todayKey && "bg-brand-50/30")}>
                  <CellButton
                    row={row}
                    cell={cellOf(row, key)}
                    clickable={isClickable(cellOf(row, key))}
                    submitting={submittingKey === cellKey}
                    onRegister={() => onRegister(row, key)}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ Cả kỳ: lưới các tuần của kỳ, mỗi ngày liệt kê các ca

export function RegisterPeriodGrid({ days, rows, todayKey, inPeriod, cellOf, submittingKey, onRegister }: GridProps) {
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
            const within = inPeriod(key);
            return (
              <div
                key={key}
                className={cn(
                  "flex min-h-32 flex-col border-b border-slate-200 p-2",
                  index % 7 !== 6 && "border-r",
                  index >= days.length - 7 && "border-b-0",
                  within ? "bg-white" : "bg-slate-50/70"
                )}
              >
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={cn(
                      "flex h-6 min-w-6 items-center justify-center rounded-full text-xs font-black",
                      key === todayKey ? "bg-brand-500 text-brand-contrast" : within ? "text-slate-800" : "text-slate-300"
                    )}
                  >
                    {day.getDate()}
                  </span>
                  {within && day.getDate() === 1 && <span className="text-[9px] font-bold text-slate-400">Tháng {day.getMonth() + 1}</span>}
                </div>
                {within && (
                  <div className="mt-1.5 space-y-1">
                    {rows.map((row) => {
                      const cellKey = `${row.shift.shiftId}|${key}`;
                      return (
                        <CellButton
                          key={cellKey}
                          row={row}
                          cell={cellOf(row, key)}
                          clickable={isClickable(cellOf(row, key))}
                          compact
                          submitting={submittingKey === cellKey}
                          onRegister={() => onRegister(row, key)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
