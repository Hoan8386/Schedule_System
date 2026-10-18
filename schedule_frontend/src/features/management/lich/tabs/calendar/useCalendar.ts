import { useMemo, useState } from "react";
import type { ShiftByDateResponse } from "@/lib/api";
import { dayKey, hhmm, localKey, pad, relId, text, timeRange, upper } from "@/lib/format";
import { isActiveAssignment, SLOTS, type CalendarView } from "../../constants";
import { useSchedule } from "../../ScheduleContext";

/** employeeId không lọc bớt ca mà chỉ làm nổi bật các ca có nhân viên đó. */
export const EMPTY_CALENDAR_FILTERS = { periodId: "", groupId: "", status: "", employeeId: "" };
export type CalendarFilters = typeof EMPTY_CALENDAR_FILTERS;

/** Một hàng "Khung ca" của chế độ tuần. */
export interface CalendarRow {
  key: string;
  label: string;
  hint: string;
  match: (item: ShiftByDateResponse) => boolean;
}

/** Thứ Hai của tuần chứa ngày. */
const startOfWeek = (day: Date) => {
  const result = new Date(day);
  result.setDate(result.getDate() - ((result.getDay() + 6) % 7));
  return result;
};

/** Trạng thái và dữ liệu suy ra cho thời khóa biểu. */
/** storeId: cửa hàng đang xem (thời khóa biểu luôn xem theo một cửa hàng). */
export function useCalendar(storeId: string) {
  const { shiftDates, specialEvents, shifts, shiftGroups, lookups } = useSchedule();
  const [filters, setFilters] = useState<CalendarFilters>(EMPTY_CALENDAR_FILTERS);
  const [view, setView] = useState<CalendarView>("month");
  const [cursor, setCursor] = useState(() => new Date());

  const groupOptions = useMemo(
    () =>
      shiftGroups
        .filter((group) => !storeId || Number(group.storeId ?? 0) === Number(storeId))
        .map((group) => {
          const id = Number(group.id ?? group.shiftGroupId ?? 0);
          return { value: id, label: text(group.shiftGroupName, `Nhóm ca #${id}`) };
        }),
    [shiftGroups, storeId]
  );
  // Đổi cửa hàng thì nhóm ca đã chọn (của cửa hàng cũ) không còn hiệu lực
  const groupId = groupOptions.some((option) => String(option.value) === filters.groupId) ? Number(filters.groupId) : 0;

  const filtered = useMemo(
    () =>
      shiftDates.filter((item) => {
        if (storeId && lookups.storeIdOf(item) !== Number(storeId)) return false;
        if (groupId && Number(lookups.templateOf(item)?.shiftGroupId ?? 0) !== groupId) return false;
        if (filters.periodId && lookups.periodIdOf(item) !== Number(filters.periodId)) return false;
        if (filters.status && upper(item.status) !== filters.status) return false;
        return true;
      }),
    [shiftDates, filters, lookups, storeId, groupId]
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

  /**
   * Hàng "Khung ca" của chế độ tuần: chưa chọn nhóm thì chia sáng / chiều / tối;
   * chọn nhóm thì mỗi ca mẫu của nhóm là một hàng với đúng giờ của ca đó.
   */
  const rows = useMemo<CalendarRow[]>(() => {
    if (!groupId) {
      return SLOTS.map((slot, index) => ({
        key: slot.label,
        label: slot.label,
        hint: slot.hint,
        match: (item) => shiftSlot(item, lookups.templateOf(item)?.startTime) === index,
      }));
    }
    const used = new Set(filtered.map((item) => relId(item, "shift")));
    const templates = shifts
      .filter((shift) => Number(shift.shiftGroupId ?? 0) === groupId)
      .filter((shift) => upper(shift.status) !== "INACTIVE" || used.has(Number(shift.id ?? shift.shiftId ?? 0)))
      .sort((a, b) => hhmm(a.startTime).localeCompare(hhmm(b.startTime)));
    const ids = new Set(templates.map((shift) => Number(shift.id ?? shift.shiftId ?? 0)));
    const result: CalendarRow[] = templates.map((shift) => {
      const id = Number(shift.id ?? shift.shiftId ?? 0);
      return { key: `shift-${id}`, label: text(shift.shiftName, `Ca #${id}`), hint: timeRange(shift.startTime, shift.endTime), match: (item) => relId(item, "shift") === id };
    });
    if (filtered.some((item) => !ids.has(relId(item, "shift")))) {
      result.push({ key: "other", label: "Ca khác", hint: "Không thuộc ca mẫu của nhóm", match: (item) => !ids.has(relId(item, "shift")) });
    }
    return result;
  }, [groupId, shifts, filtered, lookups]);

  /** Nhân viên có ca (còn hiệu lực) tại cửa hàng đang xem */
  const employeeOptions = useMemo(() => {
    const ids = new Set<number>();
    shiftDates
      .filter((item) => !storeId || lookups.storeIdOf(item) === Number(storeId))
      .forEach((item) => lookups.activeAssignmentsOf(item).forEach((assignment) => ids.add(relId(assignment, "employee"))));
    ids.delete(0);
    return Array.from(ids)
      .map((id) => ({ value: id, label: lookups.employeeName(id) }))
      .sort((a, b) => a.label.localeCompare(b.label, "vi"));
  }, [shiftDates, lookups, storeId]);

  /** Ca có nhân viên đang chọn; null khi không chọn nhân viên nào. */
  const highlight = useMemo(() => {
    if (!filters.employeeId) return null;
    const employeeId = Number(filters.employeeId);
    return (item: ShiftByDateResponse) => lookups.activeAssignmentsOf(item).some((assignment) => relId(assignment, "employee") === employeeId);
  }, [filters.employeeId, lookups]);

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

  const hasFilters = Boolean(filters.periodId || groupId || filters.status || filters.employeeId);

  return { filters, setFilters, hasFilters, groupOptions, rows, employeeOptions, highlight, view, setView, cursor, setCursor, days, title, stats, shiftsOn, eventsOn, move };
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
