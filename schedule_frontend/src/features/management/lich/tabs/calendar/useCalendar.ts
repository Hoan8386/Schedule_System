import { useCallback, useMemo, useState } from "react";
import type { ShiftByDateResponse } from "@/lib/api";
import { dayKey, fromDayKey, hhmm, localKey, pad, relId, text, upper } from "@/lib/format";
import { isActiveAssignment, type CalendarView } from "../../constants";
import { useSchedule } from "../../ScheduleContext";

/** employeeId không lọc bớt ca mà chỉ làm nổi bật các ca có nhân viên đó. */
export const EMPTY_CALENDAR_FILTERS = { periodId: "", groupId: "", status: "", employeeId: "" };
export type CalendarFilters = typeof EMPTY_CALENDAR_FILTERS;

/** Thứ Hai của tuần chứa ngày. */
const startOfWeek = (day: Date) => {
  const result = new Date(day);
  result.setDate(result.getDate() - ((result.getDay() + 6) % 7));
  return result;
};

/** Trạng thái và dữ liệu suy ra cho thời khóa biểu. */
/** storeId: cửa hàng đang xem (thời khóa biểu luôn xem theo một cửa hàng). */
export function useCalendar(storeId: string) {
  const { shiftDates, specialEvents, shiftGroups, lookups, setStoreFilter, reload } = useSchedule();
  /** Bộ lọc đang áp dụng cho thời khóa biểu */
  const [filters, setFilters] = useState<CalendarFilters>(EMPTY_CALENDAR_FILTERS);
  /** Bộ lọc đang chọn trên giao diện, chỉ áp dụng khi bấm "Tìm kiếm" */
  const [draft, setDraft] = useState<CalendarFilters>(EMPTY_CALENDAR_FILTERS);
  /** Cửa hàng đang chọn ("" = theo cửa hàng đang xem) */
  const [draftStoreId, setDraftStoreId] = useState("");
  const draftStore = draftStoreId || storeId;
  const [view, setView] = useState<CalendarView>("month");
  const [cursor, setCursor] = useState(() => new Date());

  const groupOptionsOf = useCallback(
    (store: string) =>
      shiftGroups
        .filter((group) => !store || Number(group.storeId ?? 0) === Number(store))
        .map((group) => {
          const id = Number(group.id ?? group.shiftGroupId ?? 0);
          return { value: id, label: text(group.shiftGroupName, `Nhóm ca #${id}`) };
        }),
    [shiftGroups]
  );
  const groupOptions = useMemo(() => groupOptionsOf(storeId), [groupOptionsOf, storeId]);
  const draftGroupOptions = useMemo(() => groupOptionsOf(draftStore), [groupOptionsOf, draftStore]);
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

  /** Nhân viên có ca (còn hiệu lực) tại cửa hàng đang chọn */
  const employeeOptions = useMemo(() => {
    const ids = new Set<number>();
    shiftDates
      .filter((item) => !draftStore || lookups.storeIdOf(item) === Number(draftStore))
      .forEach((item) => lookups.activeAssignmentsOf(item).forEach((assignment) => ids.add(relId(assignment, "employee"))));
    ids.delete(0);
    return Array.from(ids)
      .map((id) => ({ value: id, label: lookups.employeeName(id) }))
      .sort((a, b) => a.label.localeCompare(b.label, "vi"));
  }, [shiftDates, lookups, draftStore]);

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
  const hasDraft = Boolean(draft.periodId || draft.groupId || draft.status || draft.employeeId);

  /** Áp dụng bộ lọc đang chọn và tải lại dữ liệu từ API */
  const search = () => {
    const next = { ...draft, groupId: draftGroupOptions.some((option) => String(option.value) === draft.groupId) ? draft.groupId : "" };
    // Chọn kỳ mới thì nhảy tới tháng bắt đầu áp dụng của kỳ
    if (next.periodId && next.periodId !== filters.periodId) {
      const period = lookups.maps.period.get(Number(next.periodId));
      const start = dayKey(period?.effectiveStartDate ?? period?.startDate);
      if (start) setCursor(fromDayKey(start));
    }
    setFilters(next);
    if (draftStore !== storeId) setStoreFilter(draftStore);
    setDraftStoreId("");
    void reload();
  };

  const resetFilters = () => {
    setFilters(EMPTY_CALENDAR_FILTERS);
    setDraft(EMPTY_CALENDAR_FILTERS);
  };

  return {
    filters,
    draft,
    setDraft,
    draftStore,
    setDraftStoreId,
    search,
    resetFilters,
    hasFilters,
    hasDraft,
    filtered,
    groupOptions,
    draftGroupOptions,
    employeeOptions,
    highlight,
    view,
    setView,
    cursor,
    setCursor,
    days,
    title,
    stats,
    shiftsOn,
    eventsOn,
    move,
  };
}
