import { useMemo, useState } from "react";
import type { ShiftByDateResponse } from "@/lib/api";
import { dayKey, hhmm, localKey, pad, upper } from "@/lib/format";
import { isActiveAssignment, type CalendarView } from "../../constants";
import { useSchedule } from "../../ScheduleContext";

export const EMPTY_CALENDAR_FILTERS = { storeId: "", periodId: "", roundId: "", status: "" };
export type CalendarFilters = typeof EMPTY_CALENDAR_FILTERS;

/** Thứ Hai của tuần chứa ngày. */
const startOfWeek = (day: Date) => {
  const result = new Date(day);
  result.setDate(result.getDate() - ((result.getDay() + 6) % 7));
  return result;
};

/** Trạng thái và dữ liệu suy ra cho thời khóa biểu. */
export function useCalendar() {
  const { shiftDates, specialEvents, lookups } = useSchedule();
  const [filters, setFilters] = useState<CalendarFilters>(EMPTY_CALENDAR_FILTERS);
  const [view, setView] = useState<CalendarView>("month");
  const [cursor, setCursor] = useState(() => new Date());

  const filtered = useMemo(
    () =>
      shiftDates.filter((item) => {
        if (filters.storeId && lookups.storeIdOf(item) !== Number(filters.storeId)) return false;
        if (filters.periodId && lookups.periodIdOf(item) !== Number(filters.periodId)) return false;
        if (filters.roundId && lookups.roundIdOf(item) !== Number(filters.roundId)) return false;
        if (filters.status && upper(item.status) !== filters.status) return false;
        return true;
      }),
    [shiftDates, filters, lookups]
  );

  /** Ca theo ngày, sắp theo giờ bắt đầu */
  const byDay = useMemo(() => {
    const map = new Map<string, ShiftByDateResponse[]>();
    filtered.forEach((item) => {
      const key = dayKey(item.workDate);
      if (key) map.set(key, [...(map.get(key) ?? []), item]);
    });
    map.forEach((list) => list.sort((a, b) => hhmm(a.startTime).localeCompare(hhmm(b.startTime))));
    return map;
  }, [filtered]);

  const days = useMemo(() => {
    const base = new Date(cursor);
    base.setHours(0, 0, 0, 0);
    if (view === "month") base.setDate(1);
    const start = startOfWeek(base);
    return Array.from({ length: view === "month" ? 42 : 7 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return day;
    });
  }, [cursor, view]);

  const title = useMemo(() => {
    if (view === "month") return `Tháng ${cursor.getMonth() + 1}, ${cursor.getFullYear()}`;
    const start = days[0];
    const end = days[days.length - 1];
    return `${pad(start.getDate())}/${pad(start.getMonth() + 1)} – ${pad(end.getDate())}/${pad(end.getMonth() + 1)}/${end.getFullYear()}`;
  }, [cursor, days, view]);

  /** Thống kê trong phạm vi đang xem (tháng hoặc tuần hiện tại) */
  const stats = useMemo(() => {
    const visible = new Set((view === "month" ? days.filter((day) => day.getMonth() === cursor.getMonth()) : days).map(localKey));
    const items = Array.from(byDay.entries())
      .filter(([key]) => visible.has(key))
      .flatMap(([, list]) => list);
    let assigned = 0;
    let capacity = 0;
    let pending = 0;
    let missing = 0;
    items.forEach((item) => {
      const all = lookups.allAssignmentsOf(item);
      const active = all.filter(isActiveAssignment);
      const cap = Number(item.maxCapacity ?? item.capacity ?? 0);
      assigned += active.length;
      capacity += cap;
      pending += all.filter((assignment) => upper(assignment.status) === "PENDING").length;
      if (upper(item.status) !== "CANCELLED" && cap > 0 && active.length < cap) missing += 1;
    });
    return { total: items.length, assigned, capacity, pending, missing };
  }, [byDay, days, cursor, view, lookups]);

  const shiftsOn = (day: Date) => byDay.get(localKey(day)) ?? [];

  const eventsOn = (day: Date) => {
    const key = localKey(day);
    return specialEvents.filter((event) => {
      if (upper(event.status) === "CANCELLED") return false;
      const start = dayKey(event.startDate);
      const end = dayKey(event.endDate) || start;
      return Boolean(start) && start <= key && key <= end;
    });
  };

  const move = (direction: number) =>
    setCursor((current) => {
      const next = new Date(current);
      if (view === "month") {
        next.setDate(1);
        next.setMonth(next.getMonth() + direction);
      } else {
        next.setDate(next.getDate() + direction * 7);
      }
      return next;
    });

  const hasFilters = Boolean(filters.storeId || filters.periodId || filters.roundId || filters.status);

  return { filters, setFilters, hasFilters, view, setView, cursor, setCursor, days, title, stats, shiftsOn, eventsOn, move };
}

/** Khung ca theo giờ bắt đầu: 0 sáng, 1 chiều, 2 tối. */
export function shiftSlot(item: ShiftByDateResponse, templateStart?: unknown) {
  const hour = Number.parseInt(hhmm(item.startTime ?? templateStart).split(":")[0] ?? "", 10);
  let resolved = hour;
  if (!Number.isFinite(hour)) {
    const name = String(item.shiftName ?? "").toLowerCase();
    resolved = name.includes("tối") ? 18 : name.includes("chiều") ? 13 : 8;
  }
  if (resolved >= 17) return 2;
  if (resolved >= 12) return 1;
  return 0;
}
