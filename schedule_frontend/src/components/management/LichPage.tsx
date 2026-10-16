"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Award,
  Calendar,
  CalendarRange,
  Check,
  Clock3,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  RefreshCw,
  Star,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import {
  managerApi,
  EmployeeResponse,
  EmergencyRequestResponse,
  SchedulePeriodResponse,
  ScheduleRoundResponse,
  ScheduleSessionResponse,
  ShiftAssignmentResponse,
  ShiftByDateResponse,
  ShiftGroupResponse,
  ShiftResponse,
  SpecialEventResponse,
  StoreResponse,
} from "@/lib/managerApi";

const text = (value: unknown, fallback = "—") =>
  value === null || value === undefined || value === "" ? fallback : String(value);

const idOf = (item: Record<string, unknown>) =>
  Number(
    item.id ??
      item.schedulePeriodId ??
      item.shiftId ??
      item.shiftByDateId ??
      item.shiftAssignmentId ??
      item.scheduleRoundId ??
      item.scheduleSessionId ??
      item.shiftGroupId ??
      item.eventId ??
      item.emergencyRequestId ??
      item.roundId ??
      item.sessionId ??
      0
  );

const pad = (value: number) => String(value).padStart(2, "0");

/** Khóa ngày theo giờ địa phương (YYYY-MM-DD) – không dùng toISOString để tránh lệch múi giờ. */
const localKey = (day: Date) => `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`;

/** Chuẩn hóa ngày từ backend ("2026-10-05", "2026-10-05T08:00:00" hoặc [2026,10,5]) về YYYY-MM-DD. */
const dayKey = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "";
  if (Array.isArray(value)) {
    const [y, m, d] = value.map(Number);
    return y && m && d ? `${y}-${pad(m)}-${pad(d)}` : "";
  }
  const raw = String(value);
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? "" : localKey(parsed);
};

const date = (value: unknown) => {
  const key = dayKey(value);
  if (!key) return "—";
  const [y, m, d] = key.split("-");
  return `${d}/${m}/${y}`;
};

/** "08:00:00" | [8,0] -> "08:00" */
const hhmm = (value: unknown) => {
  if (Array.isArray(value)) return `${pad(Number(value[0] ?? 0))}:${pad(Number(value[1] ?? 0))}`;
  const match = String(value ?? "").match(/^(\d{1,2}):(\d{2})/);
  return match ? `${match[1].padStart(2, "0")}:${match[2]}` : "--:--";
};

const timeRange = (start: unknown, end: unknown) => `${hhmm(start)} – ${hhmm(end)}`;

/** "2026-10-05T08:00:00" | [2026,10,5,8,0] -> "05/10/2026 08:00" */
const dateTime = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return `${date(value.slice(0, 3))} ${hhmm(value.slice(3, 5))}`;
  const match = String(value).match(/T(\d{2}:\d{2})/);
  return match ? `${date(value)} ${match[1]}` : date(value);
};

const dateTimeRange = (start: unknown, end: unknown) => `${dateTime(start)} → ${dateTime(end)}`;

/** Trạng thái theo thời gian: sắp mở / đang mở / đã kết thúc */
const phaseOf = (start: unknown, end: unknown) => {
  const toKey = (value: unknown) => {
    if (Array.isArray(value)) return `${dayKey(value.slice(0, 3))}T${hhmm(value.slice(3, 5))}`;
    return String(value ?? "").slice(0, 16);
  };
  const now = new Date();
  const nowKey = `${localKey(now)}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const from = toKey(start);
  const to = toKey(end);
  if (from && nowKey < from) return { label: "Sắp mở", badge: "bg-sky-100 text-sky-700" };
  if (to && nowKey > to) return { label: "Đã kết thúc", badge: "bg-slate-200 text-slate-600" };
  return { label: "Đang diễn ra", badge: "bg-emerald-100 text-emerald-700" };
};

const listData = <T,>(value: unknown): T[] =>
  Array.isArray(value) ? value as T[] : [];

/** Lấy id của quan hệ: trường "xxxId" hoặc object "xxx": { id } */
const relId = (item: Record<string, unknown>, key: string) => {
  const direct = item[`${key}Id`];
  if (direct !== null && direct !== undefined && direct !== "") return Number(direct);
  const nested = item[key];
  if (nested && typeof nested === "object" && "id" in nested) return Number((nested as { id: unknown }).id);
  return 0;
};

const INACTIVE_ASSIGNMENT = ["CANCELLED", "REJECTED"];

const SHIFT_DATE_STATUS: Record<string, { label: string; card: string; badge: string }> = {
  OPEN: { label: "Đang mở", card: "border-emerald-200 bg-emerald-50/70", badge: "bg-emerald-100 text-emerald-700" },
  FULL: { label: "Đã đủ người", card: "border-blue-200 bg-blue-50/70", badge: "bg-blue-100 text-blue-700" },
  CLOSED: { label: "Đã đóng", card: "border-slate-200 bg-slate-100", badge: "bg-slate-200 text-slate-600" },
  CANCELLED: { label: "Đã hủy", card: "border-rose-200 bg-rose-50 line-through opacity-70", badge: "bg-rose-100 text-rose-700" },
};

const ASSIGNMENT_STATUS: Record<string, { label: string; badge: string }> = {
  PENDING: { label: "Chờ duyệt", badge: "bg-amber-100 text-amber-700" },
  APPROVED: { label: "Đã duyệt", badge: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "Từ chối", badge: "bg-rose-100 text-rose-700" },
  CANCELLED: { label: "Đã hủy", badge: "bg-slate-200 text-slate-600" },
  COMPLETED: { label: "Hoàn thành", badge: "bg-blue-100 text-blue-700" },
};

const shiftDateStyle = (status: unknown) =>
  SHIFT_DATE_STATUS[String(status ?? "").toUpperCase()] ?? { label: text(status), card: "border-slate-200 bg-slate-50", badge: "bg-slate-100 text-slate-600" };

const assignmentStyle = (status: unknown) =>
  ASSIGNMENT_STATUS[String(status ?? "").toUpperCase()] ?? { label: text(status), badge: "bg-slate-100 text-slate-600" };

const WEEKDAY_SHORT = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const SLOTS = [
  { label: "Ca sáng", hint: "Bắt đầu trước 12:00" },
  { label: "Ca chiều", hint: "12:00 – 16:59" },
  { label: "Ca tối", hint: "Từ 17:00" },
];

type TabKey = "period" | "shift" | "calendar" | "round" | "session" | "group" | "event" | "emergency";
type Kind = "period" | "shift" | "shiftDate" | "assignment" | "round" | "session" | "group" | "event" | "emergency";
type CalendarView = "month" | "week";

export default function LichPage() {
  const [periods, setPeriods] = useState<SchedulePeriodResponse[]>([]);
  const [shifts, setShifts] = useState<ShiftResponse[]>([]);
  const [shiftDates, setShiftDates] = useState<ShiftByDateResponse[]>([]);
  const [assignments, setAssignments] = useState<ShiftAssignmentResponse[]>([]);
  const [rounds, setRounds] = useState<ScheduleRoundResponse[]>([]);
  const [sessions, setSessions] = useState<ScheduleSessionResponse[]>([]);
  const [shiftGroups, setShiftGroups] = useState<ShiftGroupResponse[]>([]);
  const [specialEvents, setSpecialEvents] = useState<SpecialEventResponse[]>([]);
  const [emergencyRequests, setEmergencyRequests] = useState<EmergencyRequestResponse[]>([]);
  const [stores, setStores] = useState<StoreResponse[]>([]);
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<{ kind: Kind; item?: Record<string, unknown>; isNew?: boolean } | null>(null);
  const [filters, setFilters] = useState({ q: "", from: "", to: "", storeId: "", status: "" });
  const [calendarFilters, setCalendarFilters] = useState({ storeId: "", periodId: "", roundId: "", status: "" });
  const [roundPeriodFilter, setRoundPeriodFilter] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("calendar");
  const [calendarView, setCalendarView] = useState<CalendarView>("month");
  const [calendarCursor, setCalendarCursor] = useState(() => new Date());
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);
  const [calendarDetail, setCalendarDetail] = useState<{ dateKey: string; ids: number[] } | null>(null);
  const [busyAssignment, setBusyAssignment] = useState<number | null>(null);

  // Tải toàn bộ dữ liệu một lần; lọc được thực hiện phía client để các tab không ảnh hưởng lẫn nhau.
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [storeResponse, periodResponse, shiftResponse, dateResponse, assignmentResponse, employeeResponse, roundResponse, sessionResponse, groupResponse, eventResponse, emergencyResponse] = await Promise.all([
        managerApi.getStores(),
        managerApi.getSchedulePeriods(),
        managerApi.getShifts(),
        managerApi.getShiftsByDate(),
        managerApi.getShiftAssignments(),
        managerApi.getEmployees("ACTIVE"),
        managerApi.getScheduleRounds(),
        managerApi.getScheduleSessions(),
        managerApi.getShiftGroups(),
        managerApi.getSpecialEvents(),
        managerApi.getEmergencyRequests(),
      ]);

      const loadedPeriods = listData<SchedulePeriodResponse>(periodResponse.data);
      setStores(listData<StoreResponse>(storeResponse.data));
      setPeriods(loadedPeriods);
      setShifts(listData<ShiftResponse>(shiftResponse.data));
      setShiftDates(listData<ShiftByDateResponse>(dateResponse.data));
      setAssignments(listData<ShiftAssignmentResponse>(assignmentResponse.data));
      setEmployees(listData<EmployeeResponse>(employeeResponse.data));
      setRounds(listData<ScheduleRoundResponse>(roundResponse.data));
      setSessions(listData<ScheduleSessionResponse>(sessionResponse.data));
      setShiftGroups(listData<ShiftGroupResponse>(groupResponse.data));
      setSpecialEvents(listData<SpecialEventResponse>(eventResponse.data));
      setEmergencyRequests(listData<EmergencyRequestResponse>(emergencyResponse.data));

      if (loadedPeriods.length > 0) {
        setSelectedPeriodId((current) => current ?? Number(loadedPeriods[0].id ?? loadedPeriods[0].schedulePeriodId));
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tải dữ liệu lịch");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const employeeMap = useMemo(() => {
    const map = new Map<number, EmployeeResponse>();
    employees.forEach((employee) => {
      if (employee.id) map.set(Number(employee.id), employee);
    });
    return map;
  }, [employees]);

  const shiftMap = useMemo(() => {
    const map = new Map<number, ShiftResponse>();
    shifts.forEach((shift) => map.set(Number(shift.id ?? shift.shiftId ?? 0), shift));
    return map;
  }, [shifts]);

  const storeMap = useMemo(() => {
    const map = new Map<number, StoreResponse>();
    stores.forEach((store) => map.set(Number(store.id), store));
    return map;
  }, [stores]);

  const periodMap = useMemo(() => {
    const map = new Map<number, SchedulePeriodResponse>();
    periods.forEach((period) => map.set(Number(period.id ?? period.schedulePeriodId ?? 0), period));
    return map;
  }, [periods]);

  const roundMap = useMemo(() => {
    const map = new Map<number, ScheduleRoundResponse>();
    rounds.forEach((round) => map.set(Number(round.id ?? round.scheduleRoundId ?? 0), round));
    return map;
  }, [rounds]);

  const sessionMap = useMemo(() => {
    const map = new Map<number, ScheduleSessionResponse>();
    sessions.forEach((session) => map.set(Number(session.id ?? session.scheduleSessionId ?? 0), session));
    return map;
  }, [sessions]);

  const shiftGroupMap = useMemo(() => {
    const map = new Map<number, ShiftGroupResponse>();
    shiftGroups.forEach((group) => map.set(Number(group.id ?? group.shiftGroupId ?? 0), group));
    return map;
  }, [shiftGroups]);

  const roundPeriodId = (round: ScheduleRoundResponse) => relId(round as Record<string, unknown>, "schedulePeriod");
  const sessionRoundId = (session: ScheduleSessionResponse) => relId(session as Record<string, unknown>, "scheduleRound");

  /** Đợt theo kỳ và phiên theo đợt – dùng cho dòng thời gian của kỳ. */
  const roundsByPeriod = useMemo(() => {
    const map = new Map<number, ScheduleRoundResponse[]>();
    rounds.forEach((round) => {
      const periodId = roundPeriodId(round);
      map.set(periodId, [...(map.get(periodId) ?? []), round]);
    });
    map.forEach((list) => list.sort((a, b) => String(a.registrationStartAt ?? "").localeCompare(String(b.registrationStartAt ?? ""))));
    return map;
  }, [rounds]);

  const sessionsByRound = useMemo(() => {
    const map = new Map<number, ScheduleSessionResponse[]>();
    sessions.forEach((session) => {
      const roundId = sessionRoundId(session);
      map.set(roundId, [...(map.get(roundId) ?? []), session]);
    });
    map.forEach((list) => list.sort((a, b) => String(a.sessionOpenAt ?? "").localeCompare(String(b.sessionOpenAt ?? ""))));
    return map;
  }, [sessions]);

  const assignmentsByShiftDate = useMemo(() => {
    const map = new Map<number, ShiftAssignmentResponse[]>();
    assignments.forEach((assignment) => {
      const shiftId = relId(assignment as Record<string, unknown>, "shiftByDate");
      if (!shiftId) return;
      const next = map.get(shiftId) ?? [];
      next.push(assignment);
      map.set(shiftId, next);
    });
    return map;
  }, [assignments]);

  const shiftIdOf = (item: ShiftByDateResponse) => Number(item.id ?? item.shiftByDateId ?? 0);
  const templateOf = (item: ShiftByDateResponse) => shiftMap.get(relId(item as Record<string, unknown>, "shift"));
  const roundIdOf = (item: ShiftByDateResponse) => relId(item as Record<string, unknown>, "scheduleRound");
  const sessionIdOf = (item: ShiftByDateResponse) => relId(item as Record<string, unknown>, "scheduleSession");
  /** Kỳ của ca: lấy trực tiếp, nếu không có thì suy ra từ đợt. */
  const periodIdOf = (item: ShiftByDateResponse) => {
    const direct = relId(item as Record<string, unknown>, "schedulePeriod");
    if (direct) return direct;
    const round = roundMap.get(roundIdOf(item));
    return round ? roundPeriodId(round) : 0;
  };
  const storeIdOf = (item: ShiftByDateResponse) => Number(item.storeId ?? templateOf(item)?.storeId ?? 0);
  const storeNameOf = (item: ShiftByDateResponse) => {
    const storeId = storeIdOf(item);
    return text(item.storeName ?? templateOf(item)?.storeName ?? storeMap.get(storeId)?.storeName, storeId ? `Cửa hàng #${storeId}` : "Chưa rõ cửa hàng");
  };
  const capacityOf = (item: ShiftByDateResponse) =>
    Number(item.maxCapacity ?? item.capacity ?? templateOf(item)?.maxCapacity ?? 0);
  const allAssignmentsOf = (item: ShiftByDateResponse) => assignmentsByShiftDate.get(shiftIdOf(item)) ?? [];
  /** Nhân viên còn hiệu lực trong ca (không tính đã hủy / bị từ chối). */
  const employeesForShift = (item: ShiftByDateResponse) =>
    allAssignmentsOf(item).filter((assignment) => !INACTIVE_ASSIGNMENT.includes(String(assignment.status ?? "").toUpperCase()));
  const employeeName = (employeeId: unknown) =>
    employeeMap.get(Number(employeeId ?? 0))?.fullName || `NV #${text(employeeId, "?")}`;

  const filteredPeriods = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return periods.filter((period) => {
      if (q && !`${period.periodName ?? ""} ${period.status ?? ""}`.toLowerCase().includes(q)) return false;
      if (filters.status && String(period.status ?? "").toUpperCase() !== filters.status) return false;
      const start = dayKey(period.effectiveStartDate ?? period.startDate);
      const end = dayKey(period.effectiveEndDate ?? period.endDate) || start;
      if (filters.from && end && end < filters.from) return false;
      if (filters.to && start && start > filters.to) return false;
      return true;
    });
  }, [periods, filters]);

  const filteredShifts = useMemo(
    () => shifts.filter((shift) => !filters.storeId || Number(shift.storeId ?? 0) === Number(filters.storeId)),
    [shifts, filters.storeId]
  );

  const periodDetails = useMemo(() => {
    return filteredPeriods.map((period) => {
      const periodId = Number(period.id ?? period.schedulePeriodId ?? 0);
      const entries = shiftDates
        .filter((item) => periodIdOf(item) === periodId)
        .sort((a, b) => `${dayKey(a.workDate)} ${hhmm(a.startTime)}`.localeCompare(`${dayKey(b.workDate)} ${hhmm(b.startTime)}`));
      const employeesForPeriod = new Set<number>();

      entries.forEach((entry) => {
        (assignmentsByShiftDate.get(Number(entry.id ?? entry.shiftByDateId ?? 0)) ?? []).forEach((assignment) => {
          const employeeId = relId(assignment as Record<string, unknown>, "employee");
          if (employeeId && !INACTIVE_ASSIGNMENT.includes(String(assignment.status ?? "").toUpperCase())) {
            employeesForPeriod.add(employeeId);
          }
        });
      });

      return {
        periodId,
        periodName: text(period.periodName),
        startDate: date(period.startDate),
        endDate: date(period.endDate),
        effectiveStartDate: date(period.effectiveStartDate),
        effectiveEndDate: date(period.effectiveEndDate),
        description: period.description,
        periodType: period.periodType,
        status: period.status,
        rounds: roundsByPeriod.get(periodId) ?? [],
        totalEmployees: employeesForPeriod.size,
        entries,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredPeriods, shiftDates, assignmentsByShiftDate, roundsByPeriod, roundMap]);

  const selectedPeriod = periodDetails.find((item) => item.periodId === selectedPeriodId) ?? periodDetails[0];

  // Lọc riêng cho thời khóa biểu
  const calendarShiftDates = useMemo(() => {
    return shiftDates.filter((item) => {
      if (calendarFilters.storeId && storeIdOf(item) !== Number(calendarFilters.storeId)) return false;
      if (calendarFilters.periodId && periodIdOf(item) !== Number(calendarFilters.periodId)) return false;
      if (calendarFilters.roundId && roundIdOf(item) !== Number(calendarFilters.roundId)) return false;
      if (calendarFilters.status && String(item.status ?? "").toUpperCase() !== calendarFilters.status) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shiftDates, calendarFilters, shiftMap, roundMap]);

  const calendarMap = useMemo(() => {
    const map = new Map<string, ShiftByDateResponse[]>();
    calendarShiftDates.forEach((shiftDate) => {
      const key = dayKey(shiftDate.workDate);
      if (!key) return;
      const list = map.get(key) ?? [];
      list.push(shiftDate);
      map.set(key, list);
    });
    map.forEach((list) => list.sort((a, b) => hhmm(a.startTime).localeCompare(hhmm(b.startTime))));
    return map;
  }, [calendarShiftDates]);

  const calendarDays = useMemo(() => {
    const cursor = new Date(calendarCursor);
    cursor.setHours(0, 0, 0, 0);
    const start = new Date(cursor);

    if (calendarView === "month") {
      start.setDate(1);
      start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    } else {
      start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    }

    const total = calendarView === "month" ? 42 : 7;
    return Array.from({ length: total }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return day;
    });
  }, [calendarCursor, calendarView]);

  const calendarTitle = useMemo(() => {
    if (calendarView === "month") {
      return `Tháng ${calendarCursor.getMonth() + 1}, ${calendarCursor.getFullYear()}`;
    }
    const start = calendarDays[0];
    const end = calendarDays[calendarDays.length - 1];
    if (!start || !end) return "";
    return `${pad(start.getDate())}/${pad(start.getMonth() + 1)} – ${pad(end.getDate())}/${pad(end.getMonth() + 1)}/${end.getFullYear()}`;
  }, [calendarCursor, calendarDays, calendarView]);

  /** Các ngày thuộc phạm vi đang xem (tháng hiện tại hoặc tuần hiện tại) */
  const visibleKeys = useMemo(() => {
    const days = calendarView === "month"
      ? calendarDays.filter((day) => day.getMonth() === calendarCursor.getMonth())
      : calendarDays;
    return new Set(days.map(localKey));
  }, [calendarDays, calendarCursor, calendarView]);

  const calendarStats = useMemo(() => {
    const items = Array.from(calendarMap.entries())
      .filter(([key]) => visibleKeys.has(key))
      .flatMap(([, list]) => list);
    let assigned = 0;
    let capacity = 0;
    let pending = 0;
    let missing = 0;
    items.forEach((item) => {
      const all = assignmentsByShiftDate.get(Number(item.id ?? item.shiftByDateId ?? 0)) ?? [];
      const active = all.filter((assignment) => !INACTIVE_ASSIGNMENT.includes(String(assignment.status ?? "").toUpperCase()));
      const cap = Number(item.maxCapacity ?? item.capacity ?? 0);
      assigned += active.length;
      capacity += cap;
      pending += all.filter((assignment) => String(assignment.status ?? "").toUpperCase() === "PENDING").length;
      if (String(item.status ?? "").toUpperCase() !== "CANCELLED" && cap > 0 && active.length < cap) missing += 1;
    });
    return { total: items.length, assigned, capacity, pending, missing };
  }, [calendarMap, visibleKeys, assignmentsByShiftDate]);

  const shiftDetails = (day: Date) => calendarMap.get(localKey(day)) ?? [];

  const eventsForDay = (day: Date) => {
    const key = localKey(day);
    return specialEvents.filter((event) => {
      if (String(event.status ?? "").toUpperCase() === "CANCELLED") return false;
      const start = dayKey(event.startDate);
      const end = dayKey(event.endDate) || start;
      return Boolean(start) && start <= key && key <= end;
    });
  };

  const shiftStartHour = (item: ShiftByDateResponse) => {
    const value = hhmm(item.startTime ?? templateOf(item)?.startTime);
    const hour = Number.parseInt(value.split(":")[0] ?? "", 10);
    if (Number.isFinite(hour)) return hour;
    const name = String(item.shiftName ?? "").toLowerCase();
    if (name.includes("chiều")) return 13;
    if (name.includes("tối")) return 18;
    return 8;
  };

  const shiftSlot = (item: ShiftByDateResponse) => {
    const hour = shiftStartHour(item);
    if (hour >= 17) return 2;
    if (hour >= 12) return 1;
    return 0;
  };

  const openCalendarDetail = (day: Date, items = shiftDetails(day)) => {
    setCalendarDetail({ dateKey: localKey(day), ids: items.map(shiftIdOf) });
  };

  const detailItems = calendarDetail
    ? calendarDetail.ids
        .map((id) => shiftDates.find((item) => shiftIdOf(item) === id))
        .filter((item): item is ShiftByDateResponse => Boolean(item))
    : [];

  const moveCalendar = (direction: number) => {
    setCalendarCursor((current) => {
      const next = new Date(current);
      if (calendarView === "month") {
        next.setDate(1);
        next.setMonth(next.getMonth() + direction);
      } else {
        next.setDate(next.getDate() + direction * 7);
      }
      return next;
    });
  };

  const updateAssignmentStatus = async (assignment: ShiftAssignmentResponse, status: "APPROVED" | "REJECTED") => {
    const id = Number(assignment.id ?? assignment.shiftAssignmentId ?? 0);
    if (!id) return;
    setBusyAssignment(id);
    setError("");
    try {
      // Backend cập nhật toàn bộ bản ghi nên gửi kèm ca và nhân viên; người duyệt / thời điểm do backend ghi nhận.
      await managerApi.updateShiftAssignment(id, {
        shiftByDate: relId(assignment as Record<string, unknown>, "shiftByDate"),
        employee: relId(assignment as Record<string, unknown>, "employee"),
        status,
        note: assignment.note ?? undefined,
      });
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể cập nhật phân bổ");
    } finally {
      setBusyAssignment(null);
    }
  };

  const remove = async (kind: Kind, id: number) => {
    if (!id || !window.confirm("Bạn có chắc muốn xóa dữ liệu này?")) return;
    try {
      if (kind === "period") await managerApi.deleteSchedulePeriod(id);
      if (kind === "shift") await managerApi.deleteShift(id);
      if (kind === "shiftDate") await managerApi.deleteShiftByDate(id);
      if (kind === "assignment") await managerApi.deleteShiftAssignment(id);
      if (kind === "round") await managerApi.deleteScheduleRound(id);
      if (kind === "session") await managerApi.deleteScheduleSession(id);
      if (kind === "group") await managerApi.deleteShiftGroup(id);
      if (kind === "event") await managerApi.deleteSpecialEvent(id);
      if (kind === "emergency") await managerApi.deleteEmergencyRequest(id);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể xóa dữ liệu");
    }
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!modal) return;
    setSaving(true);
    setError("");

    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const body: Record<string, unknown> = { ...values };
    Object.keys(body).forEach((key) => {
      if (body[key] === "") delete body[key];
    });
    ["store", "storeId", "shift", "schedulePeriod", "schedulePeriodId", "scheduleRound", "scheduleRoundId", "scheduleSession", "shiftByDate", "employee", "shiftGroup", "shiftGroupId", "capacity", "maxCapacity", "payRate", "employeeId", "assignmentId", "fromShiftAssignmentId", "toAssignmentId"].forEach((key) => {
      if (key in body) body[key] = Number(body[key]);
    });

    try {
      const id = modal.item && !modal.isNew ? idOf(modal.item) : 0;
      if (modal.kind === "period") {
        if (id) await managerApi.updateSchedulePeriod(id, body);
        else await managerApi.createSchedulePeriod(body);
      }
      if (modal.kind === "shift") {
        if (id) await managerApi.updateShift(id, body);
        else await managerApi.createShift(body);
      }
      if (modal.kind === "shiftDate") {
        if (id) await managerApi.updateShiftByDate(id, body);
        else await managerApi.createShiftByDate(body);
      }
      if (modal.kind === "assignment") {
        if (id) await managerApi.updateShiftAssignment(id, body);
        else await managerApi.createShiftAssignment(body);
      }
      if (modal.kind === "round") {
        if (id) await managerApi.updateScheduleRound(id, body);
        else await managerApi.createScheduleRound(body);
      }
      if (modal.kind === "session") {
        if (id) await managerApi.updateScheduleSession(id, body);
        else await managerApi.createScheduleSession(body);
      }
      if (modal.kind === "group") {
        if (id) await managerApi.updateShiftGroup(id, body);
        else await managerApi.createShiftGroup(body);
      }
      if (modal.kind === "event") {
        if (id) await managerApi.updateSpecialEvent(id, body);
        else await managerApi.createSpecialEvent(body);
      }
      if (modal.kind === "emergency") {
        if (id) await managerApi.updateEmergencyRequest(id, body);
        else await managerApi.createEmergencyRequest(body);
      }
      setModal(null);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể lưu dữ liệu");
    } finally {
      setSaving(false);
    }
  };

  const value = (key: string) => {
    const item = modal?.item;
    if (!item) return "";
    let current: unknown = item[key];
    // Quan hệ: backend có thể trả { id } hoặc xxxId
    if (current && typeof current === "object" && !Array.isArray(current)) current = (current as { id?: unknown }).id;
    if (current === null || current === undefined || current === "") current = item[`${key}Id`];
    if (current === null || current === undefined) return "";
    if (Array.isArray(current)) {
      if (current.length === 3) return dayKey(current);
      if (current.length >= 5) return `${dayKey(current.slice(0, 3))}T${hhmm(current.slice(3, 5))}`;
      return hhmm(current);
    }
    return String(current);
  };

  const textarea = (name: string, label: string) => (
    <label className="text-xs font-semibold text-slate-600 sm:col-span-2">
      {label}
      <textarea
        name={name}
        rows={2}
        defaultValue={value(name)}
        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-hidden focus:border-amber-400"
      />
    </label>
  );

  const sectionTitle = (title: string, hint?: string) => (
    <div className="border-b border-slate-100 pb-1 pt-2 sm:col-span-2">
      <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">{title}</p>
      {hint && <p className="text-[10px] text-slate-400">{hint}</p>}
    </div>
  );

  const input = (name: string, label: string, type = "text", required = false) => (
    <label className="text-xs font-semibold text-slate-600">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={value(name)}
        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-hidden focus:border-amber-400"
      />
    </label>
  );

  const enumSelect = (name: string, label: string, options: readonly string[], required = true) => (
    <label className="text-xs font-semibold text-slate-600">
      {label}
      <select
        name={name}
        required={required}
        defaultValue={value(name)}
        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
      >
        <option value="">Chọn...</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );

  const select = (name: string, label: string, options: { id: number; label: string }[], required = true) => (
    <label className="text-xs font-semibold text-slate-600">
      {label}
      <select
        name={name}
        required={required}
        defaultValue={value(name)}
        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
      >
        <option value="">Chọn...</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>{option.label}</option>
        ))}
      </select>
    </label>
  );

  const statusOptionsByKind = {
    period: ["DRAFT", "OPEN", "CLOSED", "PENDING", "FINALIZED"],
    round: ["OPEN", "CLOSED"],
    session: ["OPEN", "PENDING", "CLOSED"],
    shift: ["ACTIVE", "INACTIVE"],
    shiftDate: ["OPEN", "FULL", "CLOSED", "CANCELLED"],
    assignment: ["PENDING", "APPROVED", "REJECTED", "CANCELLED", "COMPLETED"],
    group: ["ACTIVE", "INACTIVE"],
    event: ["ACTIVE", "INACTIVE", "SCHEDULED", "CANCELLED"],
    emergency: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
  } as const;

  const typeOptionsByKind = {
    period: ["WEEK", "MONTH"],
    event: ["SALE", "PROMOTION", "HOLIDAY", "SPECIAL"],
    emergency: ["CHANGE", "ADD", "CANCEL"],
  } as const;

  const storeOptions = stores.map((item) => ({ id: Number(item.id), label: text(item.storeName, `Cửa hàng #${item.id}`) }));
  const shiftOptions = shifts.map((item) => ({ id: Number(item.id), label: text(item.shiftName, `Ca #${item.id}`) }));
  const periodOptions = periods.map((item) => ({ id: Number(item.id ?? item.schedulePeriodId ?? 0), label: text(item.periodName, `Kỳ #${item.id ?? item.schedulePeriodId ?? 0}`) }));
  const shiftDateOptions = shiftDates.map((item) => ({ id: Number(item.id ?? item.shiftByDateId ?? 0), label: `${text(item.shiftName, `Ca #${item.shiftId}`)} - ${date(item.workDate)}` }));
  const employeeOptions = employees.map((item) => ({ id: Number(item.id), label: text(item.fullName, `NV #${item.id}`) }));
  const shiftGroupOptions = shiftGroups.map((item) => ({
    id: Number(item.id ?? item.shiftGroupId ?? 0),
    label: `${text(item.shiftGroupName, `Nhóm ca #${item.id ?? item.shiftGroupId ?? 0}`)}${item.storeName ? ` · ${item.storeName}` : ""}`,
  }));
  const roundOptions = rounds.map((item) => {
    const id = Number(item.id ?? item.scheduleRoundId ?? 0);
    const periodName = item.periodName ?? periodMap.get(roundPeriodId(item))?.periodName;
    return { id, label: `${text(item.roundName, `Đợt #${id}`)}${periodName ? ` · ${periodName}` : ""}` };
  });
  const sessionOptions = sessions.map((item) => {
    const id = Number(item.id ?? item.scheduleSessionId ?? 0);
    const roundName = item.roundName ?? roundMap.get(sessionRoundId(item))?.roundName;
    return { id, label: `${text(item.sessionName, `Phiên #${id}`)}${roundName ? ` · ${roundName}` : ""}` };
  });
  const roundNameOf = (roundId: number) => {
    const round = roundMap.get(roundId);
    return round ? text(round.roundName, `Đợt #${roundId}`) : roundId ? `Đợt #${roundId}` : "";
  };
  const sessionNameOf = (sessionId: number) => {
    const session = sessionMap.get(sessionId);
    return session ? text(session.sessionName, `Phiên #${sessionId}`) : sessionId ? `Phiên #${sessionId}` : "";
  };
  const groupNameOf = (groupId: number) => {
    const group = shiftGroupMap.get(groupId);
    return group ? text(group.shiftGroupName, `Nhóm ca #${groupId}`) : groupId ? `Nhóm ca #${groupId}` : "";
  };

  const form = modal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" role="dialog" aria-modal="true">
      <form onSubmit={submit} className="max-h-[90vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-800">
            {modal.item && !modal.isNew && idOf(modal.item) ? "Chỉnh sửa" : "Thêm"} {({
              period: "kỳ lập lịch",
              shift: "ca mẫu",
              shiftDate: "ca theo ngày",
              assignment: "phân bổ nhân viên",
              round: "đợt đăng ký",
              session: "phiên đăng ký",
              group: "nhóm ca",
              event: "sự kiện đặc biệt",
              emergency: "yêu cầu khẩn",
            } as Record<Kind, string>)[modal.kind]}
          </h2>
          <button type="button" onClick={() => setModal(null)} aria-label="Đóng" className="rounded-full p-2 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {modal.kind === "period" && (
            <>
              {input("periodName", "Tên kỳ", "text", true)}
              {enumSelect("periodType", "Loại kỳ", typeOptionsByKind.period, true)}
              {sectionTitle("1. Thời gian áp dụng", "Thiết lập trước tiên – khoảng ngày lịch có hiệu lực (tối thiểu 1 tuần)")}
              {input("effectiveStartDate", "Áp dụng từ", "date", true)}
              {input("effectiveEndDate", "Áp dụng đến", "date", true)}
              {sectionTitle("2. Khung thời gian của kỳ", "Bao gồm các đợt đăng ký và thời gian duyệt")}
              {input("startDate", "Kỳ bắt đầu", "date", true)}
              {input("endDate", "Kỳ kết thúc", "date", true)}
              {input("registrationOpenAt", "Mở đăng ký", "datetime-local")}
              {input("registrationCloseAt", "Đóng đăng ký", "datetime-local")}
              {enumSelect("status", "Trạng thái", statusOptionsByKind.period, true)}
              {textarea("description", "Mô tả")}
            </>
          )}

          {modal.kind === "shift" && (
            <>
              {select("store", "Cửa hàng", storeOptions)}
              {select("shiftGroup", "Nhóm ca", shiftGroupOptions, false)}
              {input("shiftCode", "Mã ca", "text", true)}
              {input("shiftName", "Tên ca", "text", true)}
              {input("startTime", "Bắt đầu", "time", true)}
              {input("endTime", "Kết thúc", "time", true)}
              {input("maxCapacity", "Số lượng", "number", true)}
              {input("payRate", "Lương theo giờ", "number")}
              {enumSelect("status", "Trạng thái", statusOptionsByKind.shift, true)}
            </>
          )}

          {modal.kind === "shiftDate" && (
            <>
              {select("shift", "Ca mẫu", shiftOptions)}
              {select("scheduleRound", "Đợt đăng ký", roundOptions, false)}
              {select("scheduleSession", "Phiên đăng ký", sessionOptions, false)}
              {select("schedulePeriod", "Kỳ lập lịch (bỏ trống = theo đợt)", periodOptions, false)}
              {input("workDate", "Ngày làm", "date", true)}
              {input("maxCapacity", "Số người tối đa", "number")}
              {input("shiftName", "Tên ca hiển thị")}
              {input("startTime", "Bắt đầu", "time")}
              {input("endTime", "Kết thúc", "time")}
              {input("payRate", "Đơn giá", "number")}
              {enumSelect("status", "Trạng thái", statusOptionsByKind.shiftDate, true)}
              {input("managerNote", "Ghi chú quản lý")}
            </>
          )}

          {modal.kind === "assignment" && (
            <>
              {select("shiftByDate", "Ca theo ngày", shiftDateOptions)}
              {select("employee", "Nhân viên", employeeOptions)}
              {enumSelect("status", "Trạng thái", statusOptionsByKind.assignment, true)}
              {input("note", "Ghi chú")}
              {input("cancellationReason", "Lý do hủy (khi hủy)")}
            </>
          )}

          {modal.kind === "round" && (
            <>
              {select("schedulePeriodId", "Thuộc kỳ", periodOptions)}
              {select("storeId", "Cửa hàng", storeOptions)}
              <div className="sm:col-span-2">{input("roundName", "Tên đợt đăng ký", "text", true)}</div>
              {input("registrationStartAt", "Bắt đầu đăng ký", "datetime-local", true)}
              {input("registrationEndAt", "Kết thúc đăng ký", "datetime-local", true)}
              {enumSelect("status", "Trạng thái", statusOptionsByKind.round, true)}
              {textarea("description", "Mô tả")}
              <p className="text-[10px] text-slate-400 sm:col-span-2">Đợt không có phiên: tất cả nhóm ca đều được đăng ký trong suốt đợt.</p>
            </>
          )}

          {modal.kind === "session" && (
            <>
              {select("scheduleRoundId", "Thuộc đợt", roundOptions)}
              {select("shiftGroupId", "Nhóm ca được đăng ký", shiftGroupOptions)}
              <div className="sm:col-span-2">{input("sessionName", "Tên phiên", "text", true)}</div>
              {input("sessionOpenAt", "Mở phiên", "datetime-local", true)}
              {input("sessionCloseAt", "Đóng phiên", "datetime-local", true)}
              {enumSelect("status", "Trạng thái", statusOptionsByKind.session, true)}
              {textarea("description", "Mô tả")}
            </>
          )}

          {modal.kind === "group" && (
            <>
              {select("storeId", "Cửa hàng", storeOptions)}
              {input("shiftGroupCode", "Mã nhóm ca", "text", true)}
              {input("shiftGroupName", "Tên nhóm ca", "text", true)}
              {input("description", "Mô tả", "text")}
              {input("payRate", "Mức lương", "number")}
              {enumSelect("status", "Trạng thái", statusOptionsByKind.group, true)}
            </>
          )}

          {modal.kind === "event" && (
            <>
              {input("eventName", "Tên sự kiện", "text", true)}
              {input("description", "Mô tả", "text")}
              {enumSelect("eventType", "Loại sự kiện", typeOptionsByKind.event, true)}
              {input("startDate", "Ngày bắt đầu", "date", true)}
              {input("endDate", "Ngày kết thúc", "date", true)}
              {enumSelect("status", "Trạng thái", statusOptionsByKind.event, true)}
            </>
          )}

          {modal.kind === "emergency" && (
            <>
              {select("employeeId", "Nhân viên", employeeOptions)}
              {enumSelect("requestType", "Loại yêu cầu", typeOptionsByKind.emergency, true)}
              {input("fromShiftAssignmentId", "Phân bổ gốc (ID)", "number")}
              {input("toAssignmentId", "Phân bổ đích (ID)", "number")}
              {input("reason", "Lý do", "text", true)}
              {enumSelect("status", "Trạng thái", statusOptionsByKind.emergency, true)}
            </>
          )}
        </div>

        <button disabled={saving} className="w-full rounded-xl bg-amber-500 px-4 py-3 text-sm font-black text-slate-900 disabled:opacity-50">
          {saving ? "Đang lưu..." : "Lưu"}
        </button>
      </form>
    </div>
  );

  const actions = (kind: Kind, item: Record<string, unknown>) => (
    <div className="flex gap-2">
      <button type="button" onClick={(event) => { event.stopPropagation(); setModal({ kind, item }); }} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50" aria-label="Chỉnh sửa">
        <Pencil className="h-4 w-4" />
      </button>
      <button type="button" onClick={(event) => { event.stopPropagation(); void remove(kind, idOf(item)); }} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50" aria-label="Xóa">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  const add = (kind: Kind) => (
    <button onClick={() => setModal({ kind })} className="ml-auto inline-flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-2 text-xs font-black text-slate-900">
      <Plus className="h-4 w-4" /> Thêm
    </button>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {form}

      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Quản lý lịch & ca làm việc</h1>
          <p className="mt-1 text-xs text-slate-500">Phân quyền theo role, xem theo cửa hàng và ca làm</p>
        </div>
        <button onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </header>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {[
            { key: "period", label: "Kỳ", icon: CalendarRange },
            { key: "shift", label: "Shift", icon: Clock3 },
            { key: "calendar", label: "Thời khóa biểu", icon: Calendar },
            { key: "round", label: "Đợt đăng ký", icon: CalendarRange },
            { key: "session", label: "Phiên", icon: Users },
            { key: "group", label: "Nhóm ca", icon: Award },
            { key: "event", label: "Sự kiện", icon: AlertTriangle },
            { key: "emergency", label: "Khẩn cấp", icon: AlertCircle },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key as TabKey)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                activeTab === key ? "bg-amber-500 text-slate-900 shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "period" && (
        <>
          <section className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <label className="min-w-56 flex-1 text-xs font-semibold text-slate-600">
              Tìm kỳ
              <input
                value={filters.q}
                onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
                placeholder="Tên kỳ hoặc trạng thái"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-hidden focus:border-amber-400"
              />
            </label>
            <label className="text-xs font-semibold text-slate-600">
              Từ ngày
              <input type="date" value={filters.from} onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))} className="mt-1 rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </label>
            <label className="text-xs font-semibold text-slate-600">
              Đến ngày
              <input type="date" value={filters.to} onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))} className="mt-1 rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </label>
            <label className="text-xs font-semibold text-slate-600">
              Trạng thái
              <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} className="mt-1 rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <option value="">Tất cả</option>
                {statusOptionsByKind.period.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </label>
            <button type="button" onClick={() => setFilters({ q: "", from: "", to: "", storeId: "", status: "" })} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
              Đặt lại
            </button>
          </section>

          <section className="grid gap-5 lg:grid-cols-[1.1fr_1.3fr]">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
                <CalendarRange className="h-4 w-4 text-amber-600" />
                <h2 className="text-sm font-bold text-slate-800">Tất cả kỳ ({filteredPeriods.length})</h2>
                {add("period")}
              </div>
              <div className="divide-y divide-slate-100">
                {filteredPeriods.length === 0 && (
                  <div className="p-5 text-xs text-slate-500">Không có kỳ lập lịch phù hợp.</div>
                )}
                {filteredPeriods.map((item) => {
                  const id = Number(item.id ?? item.schedulePeriodId ?? 0);
                  const isSelected = id === (selectedPeriod?.periodId ?? 0);
                  return (
                    <div
                      key={id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedPeriodId(id)}
                      onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedPeriodId(id); }}
                      className={`flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-4 text-left transition ${isSelected ? "bg-amber-50" : "hover:bg-slate-50"}`}
                    >
                      <div>
                        <p className="text-sm font-black text-slate-800">
                          {text(item.periodName)}
                          {item.periodType && <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">{item.periodType === "WEEK" ? "Tuần" : item.periodType === "MONTH" ? "Tháng" : text(item.periodType)}</span>}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500">
                          Áp dụng: {item.effectiveStartDate ? `${date(item.effectiveStartDate)} – ${date(item.effectiveEndDate)}` : "chưa thiết lập"}
                        </p>
                        <p className="text-[10px] text-slate-400">Kỳ: {date(item.startDate)} – {date(item.endDate)} · {(roundsByPeriod.get(id) ?? []).length} đợt</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">{text(item.status)}</span>
                        {actions("period", item as Record<string, unknown>)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
                <Users className="h-4 w-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-800">
                  {selectedPeriod ? `Nhân viên trong ${selectedPeriod.periodName}` : "Chi tiết kỳ"}
                </h2>
              </div>

              {selectedPeriod ? (
                <div className="space-y-4 p-5">
                  <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                    <span className="rounded-full bg-slate-100 px-2 py-1">{text(selectedPeriod.status)}</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">{selectedPeriod.totalEmployees} nhân viên</span>
                    <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700">{selectedPeriod.entries.length} ca</span>
                  </div>
                  {selectedPeriod.description && <p className="text-xs text-slate-600">{selectedPeriod.description}</p>}

                  {/* Dòng thời gian: Kỳ (đợt đăng ký → các phiên; duyệt) → Áp dụng */}
                  <div className="rounded-xl border border-slate-200 p-3">
                    <p className="mb-3 text-[11px] font-black uppercase tracking-wider text-slate-500">Mốc thời gian</p>
                    <ol className="relative space-y-3 border-l-2 border-slate-200 pl-4">
                      <li className="relative">
                        <span className="absolute left-[-1.4rem] top-1 h-3 w-3 rounded-full border-2 border-white bg-slate-400" />
                        <p className="text-xs font-bold text-slate-700">Kỳ đăng ký & duyệt</p>
                        <p className="text-[11px] text-slate-500">{selectedPeriod.startDate} – {selectedPeriod.endDate}</p>
                      </li>
                      {selectedPeriod.rounds.length === 0 ? (
                        <li className="relative">
                          <span className="absolute left-[-1.4rem] top-1 h-3 w-3 rounded-full border-2 border-white bg-amber-300" />
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-slate-400">Chưa có đợt đăng ký</p>
                            <button type="button" onClick={() => setModal({ kind: "round", item: { schedulePeriodId: selectedPeriod.periodId, status: "OPEN" }, isNew: true })} className="text-[11px] font-bold text-amber-700 hover:underline">
                              + Tạo đợt
                            </button>
                          </div>
                        </li>
                      ) : (
                        selectedPeriod.rounds.map((round) => {
                          const roundId = Number(round.id ?? round.scheduleRoundId ?? 0);
                          const roundSessions = sessionsByRound.get(roundId) ?? [];
                          const phase = phaseOf(round.registrationStartAt, round.registrationEndAt);
                          return (
                            <li key={roundId} className="relative">
                              <span className="absolute left-[-1.4rem] top-1 h-3 w-3 rounded-full border-2 border-white bg-amber-500" />
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-xs font-bold text-slate-800">{text(round.roundName, `Đợt #${roundId}`)}</p>
                                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${phase.badge}`}>{phase.label}</span>
                                {round.storeName && <span className="text-[10px] text-slate-400">{round.storeName}</span>}
                              </div>
                              <p className="text-[11px] text-slate-500">{dateTimeRange(round.registrationStartAt, round.registrationEndAt)}</p>
                              {roundSessions.length === 0 ? (
                                <p className="mt-1 text-[10px] italic text-slate-400">Không chia phiên – mọi nhóm ca đăng ký trong cả đợt</p>
                              ) : (
                                <ul className="mt-1.5 space-y-1">
                                  {roundSessions.map((session) => {
                                    const sessionId = Number(session.id ?? session.scheduleSessionId ?? 0);
                                    return (
                                      <li key={sessionId} className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 px-2 py-1 text-[10px]">
                                        <span className="font-bold text-slate-700">{text(session.sessionName, `Phiên #${sessionId}`)}</span>
                                        <span className="rounded bg-violet-100 px-1.5 py-0.5 font-semibold text-violet-700">
                                          {text(session.shiftGroupName ?? groupNameOf(relId(session as Record<string, unknown>, "shiftGroup")), "Mọi nhóm ca")}
                                        </span>
                                        <span className="text-slate-500">{dateTimeRange(session.sessionOpenAt, session.sessionCloseAt)}</span>
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}
                            </li>
                          );
                        })
                      )}
                      <li className="relative">
                        <span className="absolute left-[-1.4rem] top-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                        <p className="text-xs font-bold text-emerald-700">Áp dụng lịch</p>
                        <p className="text-[11px] text-slate-500">
                          {selectedPeriod.effectiveStartDate !== "—" ? `${selectedPeriod.effectiveStartDate} – ${selectedPeriod.effectiveEndDate}` : "Chưa thiết lập thời gian áp dụng"}
                        </p>
                      </li>
                    </ol>
                  </div>

                  <div className="space-y-3">
                    {selectedPeriod.entries.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 p-4 text-xs text-slate-500">Chưa có ca nào trong kỳ này.</div>
                    ) : (
                      selectedPeriod.entries.map((entry) => {
                        const entryId = Number(entry.id ?? entry.shiftByDateId ?? 0);
                        const employeeNames = employeesForShift(entry).map((assignment) => employeeName(relId(assignment as Record<string, unknown>, "employee")));

                        return (
                          <button
                            key={entryId}
                            type="button"
                            onClick={() => setCalendarDetail({ dateKey: dayKey(entry.workDate), ids: [entryId] })}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-left hover:border-amber-300 hover:bg-amber-50"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-bold text-slate-800">{text(entry.shiftName, `Ca #${entryId}`)}</p>
                                <p className="text-[11px] text-slate-500">
                                  {date(entry.workDate)} · {timeRange(entry.startTime, entry.endTime)}
                                  {roundIdOf(entry) ? ` · ${text(entry.roundName ?? roundNameOf(roundIdOf(entry)))}` : ""}
                                </p>
                              </div>
                              <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-slate-600">{employeeNames.length} NV</span>
                            </div>
                            <p className="mt-2 text-[11px] text-slate-600">
                              {employeeNames.length > 0 ? employeeNames.slice(0, 3).join(", ") : "Chưa có nhân viên"}
                              {employeeNames.length > 3 ? ` +${employeeNames.length - 3}` : ""}
                            </p>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-5 text-xs text-slate-500">Chọn một kỳ để xem nhân viên.</div>
              )}
            </div>
          </section>
        </>
      )}

      {activeTab === "shift" && (
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex flex-wrap items-end gap-3 border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-800">Danh sách Shift ({filteredShifts.length})</h2>
            </div>
            <label className="ml-auto min-w-52 text-[11px] font-semibold text-slate-600">
              Cửa hàng
              <select
                value={filters.storeId}
                onChange={(event) => setFilters((current) => ({ ...current, storeId: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">Tất cả cửa hàng</option>
                {stores.map((store) => (
                  <option key={store.id} value={String(store.id)}>{text(store.storeName, `Cửa hàng #${store.id}`)}</option>
                ))}
              </select>
            </label>
            {add("shift")}
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredShifts.map((item) => (
              <div key={Number(item.id ?? item.shiftId ?? 0)} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-slate-800">{text(item.shiftName, text(item.shiftCode))}</p>
                    <p className="mt-1 text-[11px] text-slate-500">{timeRange(item.startTime, item.endTime)}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="inline-flex rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-800">
                        {text(item.storeName, item.storeId ? `Cửa hàng #${item.storeId}` : "Chưa xác định cửa hàng")}
                      </span>
                      <span className="inline-flex rounded-full bg-violet-100 px-2 py-1 text-[11px] font-semibold text-violet-700">
                        {text(item.shiftGroupName ?? groupNameOf(relId(item as Record<string, unknown>, "shiftGroup")), "Chưa gán nhóm ca")}
                      </span>
                    </div>
                  </div>
                  {actions("shift", item as Record<string, unknown>)}
                </div>
                <div className="mt-4 flex items-center justify-between text-[11px] text-slate-600">
                  <span className="rounded-full bg-white px-2 py-1">{text(item.maxCapacity, "0")} người</span>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">{text(item.status)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === "calendar" && (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-4">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <CalendarRange className="h-5 w-5 text-amber-500" />
                    <h2 className="text-xl font-black tracking-tight text-slate-900">Thời khóa biểu ca làm</h2>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Bấm vào một ca để xem, duyệt và phân bổ nhân viên.</p>
                </div>
                {add("shiftDate")}
              </div>

              <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                <label className="min-w-48 text-[11px] font-semibold text-slate-600">
                  Cửa hàng
                  <select
                    value={calendarFilters.storeId}
                    onChange={(event) => setCalendarFilters((current) => ({ ...current, storeId: event.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium outline-hidden focus:border-amber-400"
                  >
                    <option value="">Tất cả cửa hàng</option>
                    {stores.map((store) => (
                      <option key={store.id} value={String(store.id)}>{text(store.storeName, `Cửa hàng #${store.id}`)}</option>
                    ))}
                  </select>
                </label>
                <label className="min-w-48 text-[11px] font-semibold text-slate-600">
                  Kỳ lập lịch
                  <select
                    value={calendarFilters.periodId}
                    onChange={(event) => {
                      const periodId = event.target.value;
                      setCalendarFilters((current) => ({ ...current, periodId, roundId: "" }));
                      // Nhảy tới tháng bắt đầu áp dụng của kỳ được chọn
                      const period = periodMap.get(Number(periodId));
                      const start = dayKey(period?.effectiveStartDate ?? period?.startDate);
                      if (start) {
                        const [y, m, d] = start.split("-").map(Number);
                        setCalendarCursor(new Date(y, m - 1, d));
                      }
                    }}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium outline-hidden focus:border-amber-400"
                  >
                    <option value="">Tất cả kỳ</option>
                    {periodOptions.map((period) => (
                      <option key={period.id} value={String(period.id)}>{period.label}</option>
                    ))}
                  </select>
                </label>
                <label className="min-w-48 text-[11px] font-semibold text-slate-600">
                  Đợt đăng ký
                  <select
                    value={calendarFilters.roundId}
                    onChange={(event) => setCalendarFilters((current) => ({ ...current, roundId: event.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium outline-hidden focus:border-amber-400"
                  >
                    <option value="">Tất cả đợt</option>
                    {rounds
                      .filter((round) => !calendarFilters.periodId || roundPeriodId(round) === Number(calendarFilters.periodId))
                      .map((round) => {
                        const id = Number(round.id ?? round.scheduleRoundId ?? 0);
                        return <option key={id} value={String(id)}>{text(round.roundName, `Đợt #${id}`)}</option>;
                      })}
                  </select>
                </label>
                <label className="min-w-44 text-[11px] font-semibold text-slate-600">
                  Trạng thái ca
                  <select
                    value={calendarFilters.status}
                    onChange={(event) => setCalendarFilters((current) => ({ ...current, status: event.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium outline-hidden focus:border-amber-400"
                  >
                    <option value="">Tất cả trạng thái</option>
                    {statusOptionsByKind.shiftDate.map((status) => (
                      <option key={status} value={status}>{shiftDateStyle(status).label}</option>
                    ))}
                  </select>
                </label>
                {(calendarFilters.storeId || calendarFilters.periodId || calendarFilters.roundId || calendarFilters.status) && (
                  <button
                    type="button"
                    onClick={() => setCalendarFilters({ storeId: "", periodId: "", roundId: "", status: "" })}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Bỏ lọc
                  </button>
                )}
                <div className="flex items-center gap-1 rounded-xl border border-slate-200 p-1 lg:ml-auto">
                  {(["week", "month"] as CalendarView[]).map((view) => (
                    <button
                      key={view}
                      type="button"
                      onClick={() => setCalendarView(view)}
                      className={`rounded-lg px-4 py-2 text-xs font-bold transition ${calendarView === view ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}
                    >
                      {view === "week" ? "Tuần" : "Tháng"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-3 border-b border-slate-100 py-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => moveCalendar(-1)} aria-label={calendarView === "month" ? "Tháng trước" : "Tuần trước"} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => moveCalendar(1)} aria-label={calendarView === "month" ? "Tháng sau" : "Tuần sau"} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50">
                  <ChevronRight className="h-4 w-4" />
                </button>
                <h3 className="ml-1 text-base font-black text-slate-800">{calendarTitle}</h3>
                <button type="button" onClick={() => setCalendarCursor(new Date())} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
                  Hôm nay
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-700">{calendarStats.total} ca</span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-bold text-emerald-700">
                  {calendarStats.assigned}{calendarStats.capacity > 0 ? `/${calendarStats.capacity}` : ""} lượt phân bổ
                </span>
                {calendarStats.pending > 0 && (
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 font-bold text-amber-700">{calendarStats.pending} chờ duyệt</span>
                )}
                {calendarStats.missing > 0 && (
                  <span className="rounded-full bg-rose-50 px-2.5 py-1 font-bold text-rose-700">{calendarStats.missing} ca thiếu người</span>
                )}
              </div>
            </div>

            {loading && shiftDates.length === 0 ? (
              <div className="mt-4 flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Đang tải lịch...
              </div>
            ) : calendarView === "month" ? (
              <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
                <div className="min-w-180">
                  <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                    {["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"].map((label, index) => (
                      <div key={label} className={`px-2 py-2 text-center text-[11px] font-bold ${index >= 5 ? "text-rose-500" : "text-slate-500"}`}>{label}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7">
                    {calendarDays.map((day, index) => {
                      const items = shiftDetails(day);
                      const events = eventsForDay(day);
                      const isCurrentMonth = day.getMonth() === calendarCursor.getMonth();
                      const isToday = localKey(day) === localKey(new Date());
                      const visible = items.slice(0, 3);
                      return (
                        <div
                          key={localKey(day)}
                          className={`flex min-h-36 flex-col border-b border-slate-200 p-2 ${index % 7 === 6 ? "" : "border-r"} ${index >= 35 ? "border-b-0" : ""} ${isCurrentMonth ? "bg-white" : "bg-slate-50/70"}`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className={`flex h-6 min-w-6 items-center justify-center rounded-full text-xs font-black ${isToday ? "bg-amber-500 text-slate-950" : isCurrentMonth ? "text-slate-800" : "text-slate-300"}`}>
                              {day.getDate()}
                            </span>
                            {items.length > 0 && (
                              <button type="button" onClick={() => openCalendarDetail(day)} className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 hover:bg-amber-100">
                                {items.length} ca
                              </button>
                            )}
                          </div>
                          {events.map((event) => (
                            <p key={Number(event.eventId ?? event.id)} title={text(event.description, "")} className="mt-1 flex items-center gap-1 truncate rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-rose-600">
                              <Star className="h-2.5 w-2.5 shrink-0" /> <span className="truncate">{text(event.eventName)}</span>
                            </p>
                          ))}
                          <div className={`mt-1.5 space-y-1 ${isCurrentMonth ? "" : "opacity-60"}`}>
                            {visible.map((item) => {
                              const style = shiftDateStyle(item.status);
                              const cap = capacityOf(item);
                              const count = employeesForShift(item).length;
                              return (
                                <button
                                  key={shiftIdOf(item)}
                                  type="button"
                                  onClick={() => openCalendarDetail(day, [item])}
                                  title={`${text(item.shiftName)} · ${storeNameOf(item)} · ${style.label}`}
                                  className={`block w-full rounded-md border px-1.5 py-1 text-left transition hover:border-amber-400 hover:shadow-sm ${style.card}`}
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="truncate text-[10px] font-bold text-slate-800">{hhmm(item.startTime)}–{hhmm(item.endTime)}</span>
                                    <span className={`shrink-0 text-[9px] font-bold ${cap > 0 && count >= cap ? "text-blue-600" : count === 0 ? "text-rose-500" : "text-slate-600"}`}>
                                      {count}{cap > 0 ? `/${cap}` : ""}
                                    </span>
                                  </div>
                                  <p className="truncate text-[9px] text-slate-500">{text(item.shiftName, `Ca #${shiftIdOf(item)}`)}</p>
                                </button>
                              );
                            })}
                            {items.length > visible.length && (
                              <button type="button" onClick={() => openCalendarDetail(day)} className="w-full rounded-md px-1.5 py-0.5 text-left text-[10px] font-bold text-amber-700 hover:bg-amber-50">
                                +{items.length - visible.length} ca khác
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
                <div className="min-w-220">
                  <div className="grid grid-cols-[6.5rem_repeat(7,minmax(0,1fr))] border-b border-slate-200 bg-slate-50">
                    <div className="border-r border-slate-200 p-3 text-center text-[10px] font-bold text-slate-500">Khung ca</div>
                    {calendarDays.map((day, index) => {
                      const isToday = localKey(day) === localKey(new Date());
                      const events = eventsForDay(day);
                      return (
                        <div key={localKey(day)} className={`p-2 text-center ${index < 6 ? "border-r border-slate-200" : ""} ${isToday ? "bg-amber-50" : ""}`}>
                          <p className={`text-[10px] font-semibold ${day.getDay() === 0 || day.getDay() === 6 ? "text-rose-500" : "text-slate-500"}`}>{WEEKDAY_SHORT[day.getDay()]}</p>
                          <p className={`mt-0.5 text-lg font-black ${isToday ? "text-amber-600" : "text-slate-800"}`}>{pad(day.getDate())}/{pad(day.getMonth() + 1)}</p>
                          {events.map((event) => (
                            <p key={Number(event.eventId ?? event.id)} className="mt-1 truncate rounded bg-rose-50 px-1 py-0.5 text-[9px] font-bold text-rose-600" title={text(event.eventName)}>
                              ★ {text(event.eventName)}
                            </p>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                  {SLOTS.map((slot, slotIndex) => (
                    <div key={slot.label} className={`grid min-h-32 grid-cols-[6.5rem_repeat(7,minmax(0,1fr))] ${slotIndex < SLOTS.length - 1 ? "border-b border-slate-200" : ""}`}>
                      <div className="border-r border-slate-200 bg-slate-50/60 p-3">
                        <p className="text-[11px] font-black text-slate-700">{slot.label}</p>
                        <p className="mt-1 text-[9px] text-slate-400">{slot.hint}</p>
                      </div>
                      {calendarDays.map((day, index) => {
                        const items = shiftDetails(day).filter((item) => shiftSlot(item) === slotIndex);
                        return (
                          <div key={`${slot.label}-${localKey(day)}`} className={`space-y-2 p-1.5 ${index < 6 ? "border-r border-slate-200" : ""}`}>
                            {items.map((item) => {
                              const style = shiftDateStyle(item.status);
                              const cap = capacityOf(item);
                              const workers = employeesForShift(item);
                              return (
                                <button
                                  key={shiftIdOf(item)}
                                  type="button"
                                  onClick={() => openCalendarDetail(day, [item])}
                                  className={`block w-full rounded-lg border p-2 text-left shadow-xs transition hover:border-amber-400 hover:shadow-sm ${style.card}`}
                                >
                                  <p className="truncate text-[10px] font-black text-slate-800">{text(item.shiftName, slot.label)}</p>
                                  <p className="mt-0.5 text-[10px] font-bold text-slate-600">{timeRange(item.startTime, item.endTime)}</p>
                                  <p className="mt-0.5 truncate text-[9px] text-slate-500">{storeNameOf(item)}</p>
                                  <div className="mt-1.5 flex items-center justify-between gap-1">
                                    <span className={`text-[10px] font-bold ${cap > 0 && workers.length >= cap ? "text-blue-600" : workers.length === 0 ? "text-rose-500" : "text-emerald-700"}`}>
                                      {workers.length}{cap > 0 ? `/${cap}` : ""} NV
                                    </span>
                                    <span className={`rounded px-1 py-0.5 text-[8px] font-bold ${style.badge}`}>{style.label}</span>
                                  </div>
                                  {workers.length > 0 && (
                                    <p className="mt-1 truncate text-[9px] text-slate-500">
                                      {workers.slice(0, 2).map((assignment) => employeeName(relId(assignment as Record<string, unknown>, "employee"))).join(", ")}
                                      {workers.length > 2 ? ` +${workers.length - 2}` : ""}
                                    </p>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!loading && calendarStats.total === 0 && (
              <p className="mt-3 text-center text-xs text-slate-400">
                Không có ca nào trong {calendarView === "month" ? "tháng" : "tuần"} này{calendarFilters.storeId || calendarFilters.periodId || calendarFilters.roundId || calendarFilters.status ? " với bộ lọc hiện tại" : ""}.
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-500">
              {Object.entries(SHIFT_DATE_STATUS).map(([key, style]) => (
                <span key={key} className={`rounded-md border px-2 py-1 ${style.card}`}>{style.label}</span>
              ))}
              <span className="rounded-md bg-rose-50 px-2 py-1 text-rose-600">★ Sự kiện đặc biệt</span>
              <span className="ml-auto">Số trên ca = nhân viên đã phân bổ / số người tối đa</span>
            </div>
          </section>

          {calendarDetail && (
            <div className="fixed inset-0 z-40 flex justify-end bg-slate-950/50" onClick={() => setCalendarDetail(null)}>
              <div className="h-full w-full max-w-xl overflow-y-auto bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Chi tiết ca</p>
                    <h3 className="text-xl font-black text-slate-800">
                      {(() => {
                        const [y, m, d] = calendarDetail.dateKey.split("-").map(Number);
                        const day = new Date(y, m - 1, d);
                        return `${["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"][day.getDay()]}, ${date(calendarDetail.dateKey)}`;
                      })()}
                    </h3>
                  </div>
                  <button type="button" onClick={() => setCalendarDetail(null)} aria-label="Đóng" className="rounded-full p-2 hover:bg-slate-100">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {detailItems.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-200 p-4 text-xs text-slate-500">Ca này không còn tồn tại.</div>
                  )}
                  {detailItems.map((item) => {
                    const entryId = shiftIdOf(item);
                    const style = shiftDateStyle(item.status);
                    const cap = capacityOf(item);
                    const all = allAssignmentsOf(item);
                    const activeCount = employeesForShift(item).length;
                    const period = periodMap.get(periodIdOf(item));
                    return (
                      <div key={entryId} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-base font-black text-slate-800">{text(item.shiftName, `Ca #${entryId}`)}</p>
                            <p className="text-xs text-slate-500">{timeRange(item.startTime, item.endTime)} · {storeNameOf(item)}</p>
                            <div className="mt-1 flex flex-wrap gap-1 text-[10px]">
                              {period && <span className="rounded bg-slate-200/70 px-1.5 py-0.5 text-slate-600">Kỳ: {text(period.periodName)}</span>}
                              {roundIdOf(item) > 0 && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-800">{text(item.roundName ?? roundNameOf(roundIdOf(item)))}</span>}
                              {sessionIdOf(item) > 0 && <span className="rounded bg-violet-100 px-1.5 py-0.5 text-violet-700">{text(item.sessionName ?? sessionNameOf(sessionIdOf(item)))}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${style.badge}`}>{style.label}</span>
                            {actions("shiftDate", item as Record<string, unknown>)}
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                          <span className="rounded-full bg-white px-2 py-1 font-bold text-slate-700">{activeCount}{cap > 0 ? `/${cap}` : ""} nhân viên</span>
                          {item.payRate != null && <span className="rounded-full bg-white px-2 py-1 text-emerald-700">{Number(item.payRate).toLocaleString("vi-VN")} đ</span>}
                          {item.managerNote && <span className="rounded-full bg-white px-2 py-1 text-slate-500">{text(item.managerNote)}</span>}
                        </div>

                        <div className="mt-4 space-y-2">
                          {all.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-200 p-3 text-xs text-slate-500">Chưa có nhân viên được phân bổ.</div>
                          ) : (
                            all.map((assignment) => {
                              const assignmentId = Number(assignment.id ?? assignment.shiftAssignmentId ?? 0);
                              const aStyle = assignmentStyle(assignment.status);
                              const isPending = String(assignment.status ?? "").toUpperCase() === "PENDING";
                              const busy = busyAssignment === assignmentId;
                              return (
                                <div key={assignmentId || `${entryId}-${String(assignment.employeeId)}`} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-slate-800">{employeeName(relId(assignment as Record<string, unknown>, "employee"))}</p>
                                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${aStyle.badge}`}>{aStyle.label}</span>
                                    <p className="mt-1 text-[10px] text-slate-400">
                                      {assignment.registeredAt ? `Đăng ký ${dateTime(assignment.registeredAt)}` : ""}
                                      {assignment.approvedAt || assignment.approvedBy
                                        ? ` · Duyệt ${assignment.approvedBy ? `bởi ${employeeName(assignment.approvedBy)} ` : ""}${assignment.approvedAt ? dateTime(assignment.approvedAt) : ""}`
                                        : ""}
                                      {assignment.cancelledAt || assignment.cancelledBy
                                        ? ` · Hủy ${assignment.cancelledBy ? `bởi ${employeeName(assignment.cancelledBy)} ` : ""}${assignment.cancelledAt ? dateTime(assignment.cancelledAt) : ""}`
                                        : ""}
                                    </p>
                                    {assignment.cancellationReason && <p className="text-[10px] text-rose-500">Lý do hủy: {assignment.cancellationReason}</p>}
                                  </div>
                                  <div className="flex shrink-0 items-center gap-1">
                                    {isPending && (
                                      <>
                                        <button
                                          type="button"
                                          disabled={busy}
                                          onClick={() => void updateAssignmentStatus(assignment, "APPROVED")}
                                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2 py-1.5 text-[11px] font-bold text-emerald-700 disabled:opacity-50"
                                        >
                                          <Check className="h-3.5 w-3.5" /> Duyệt
                                        </button>
                                        <button
                                          type="button"
                                          disabled={busy}
                                          onClick={() => void updateAssignmentStatus(assignment, "REJECTED")}
                                          className="inline-flex items-center gap-1 rounded-lg bg-rose-100 px-2 py-1.5 text-[11px] font-bold text-rose-700 disabled:opacity-50"
                                        >
                                          <X className="h-3.5 w-3.5" /> Từ chối
                                        </button>
                                      </>
                                    )}
                                    {actions("assignment", assignment as Record<string, unknown>)}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => setModal({ kind: "assignment", item: { shiftByDate: entryId, status: "APPROVED" }, isNew: true })}
                          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-amber-300 bg-white px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-50"
                        >
                          <UserPlus className="h-4 w-4" /> Phân bổ nhân viên vào ca
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "round" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div className="flex items-center gap-2">
              <CalendarRange className="h-4 w-4 text-amber-600" />
              <h2 className="text-sm font-bold text-slate-800">Đợt đăng ký lịch ({rounds.length})</h2>
            </div>
            <label className="ml-auto min-w-52 text-[11px] font-semibold text-slate-600">
              Kỳ lập lịch
              <select
                value={roundPeriodFilter}
                onChange={(event) => setRoundPeriodFilter(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">Tất cả kỳ</option>
                {periodOptions.map((period) => (
                  <option key={period.id} value={String(period.id)}>{period.label}</option>
                ))}
              </select>
            </label>
            <button
              onClick={() => setModal({ kind: "round", item: roundPeriodFilter ? { schedulePeriodId: Number(roundPeriodFilter) } : undefined, isNew: true })}
              className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-2 text-xs font-black text-slate-900"
            >
              <Plus className="h-4 w-4" /> Thêm
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {rounds
              .filter((item) => !roundPeriodFilter || roundPeriodId(item) === Number(roundPeriodFilter))
              .map((item) => {
              const id = Number(item.id ?? item.scheduleRoundId ?? 0);
              const periodName = item.periodName ?? periodMap.get(roundPeriodId(item))?.periodName;
              const storeName = item.storeName ?? storeMap.get(relId(item as Record<string, unknown>, "store"))?.storeName;
              const roundSessions = sessionsByRound.get(id) ?? [];
              const phase = phaseOf(item.registrationStartAt, item.registrationEndAt);
              const shiftCount = shiftDates.filter((shiftDate) => roundIdOf(shiftDate) === id).length;
              return (
                <div key={id} className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-800">{text(item.roundName, `Đợt #${id}`)}</p>
                      <p className="mt-1 text-[11px] text-slate-500">{dateTimeRange(item.registrationStartAt, item.registrationEndAt)}</p>
                    </div>
                    {actions("round", item as Record<string, unknown>)}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1 text-[10px]">
                    <span className="rounded bg-slate-200/70 px-1.5 py-0.5 text-slate-600">Kỳ: {text(periodName, "chưa gán")}</span>
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-800">{text(storeName, "Chưa gán cửa hàng")}</span>
                    <span className="rounded bg-blue-50 px-1.5 py-0.5 text-blue-700">{shiftCount} ca</span>
                  </div>
                  {item.description && <p className="mt-2 text-[11px] text-slate-600">{item.description}</p>}
                  <div className="mt-3 space-y-1">
                    {roundSessions.length === 0 ? (
                      <p className="text-[10px] italic text-slate-400">Không chia phiên – mọi nhóm ca đăng ký trong cả đợt</p>
                    ) : (
                      roundSessions.map((session) => {
                        const sessionId = Number(session.id ?? session.scheduleSessionId ?? 0);
                        return (
                          <div key={sessionId} className="flex items-center justify-between gap-2 rounded-lg bg-white px-2 py-1 text-[10px]">
                            <span className="truncate font-bold text-slate-700">{text(session.sessionName, `Phiên #${sessionId}`)}</span>
                            <span className="shrink-0 text-slate-500">{dateTime(session.sessionOpenAt)}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-3 text-[11px]">
                    <div className="flex gap-1">
                      <span className="rounded-full bg-amber-100 px-2 py-1 font-bold text-amber-800">{text(item.status)}</span>
                      <span className={`rounded-full px-2 py-1 font-bold ${phase.badge}`}>{phase.label}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setModal({ kind: "session", item: { scheduleRoundId: id, status: "PENDING" }, isNew: true })}
                      className="font-bold text-violet-700 hover:underline"
                    >
                      + Phiên
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {activeTab === "session" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-800">Phiên đăng ký ({sessions.length})</h2>
            </div>
            {add("session")}
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {sessions.map((item) => {
              const id = Number(item.id ?? item.scheduleSessionId ?? 0);
              const roundId = sessionRoundId(item);
              const phase = phaseOf(item.sessionOpenAt, item.sessionCloseAt);
              return (
                <div key={id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-800">{text(item.sessionName, `Phiên #${id}`)}</p>
                      <p className="mt-1 text-[11px] text-slate-500">{dateTimeRange(item.sessionOpenAt, item.sessionCloseAt)}</p>
                    </div>
                    {actions("session", item as Record<string, unknown>)}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1 text-[10px]">
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-800">{text(item.roundName ?? roundNameOf(roundId), "Chưa gán đợt")}</span>
                    <span className="rounded bg-violet-100 px-1.5 py-0.5 text-violet-700">
                      {text(item.shiftGroupName ?? groupNameOf(relId(item as Record<string, unknown>, "shiftGroup")), "Chưa gán nhóm ca")}
                    </span>
                  </div>
                  {item.description && <p className="mt-2 text-[11px] text-slate-600">{item.description}</p>}
                  <div className="mt-3 flex items-center gap-1 text-[11px]">
                    <span className="rounded-full bg-blue-100 px-2 py-1 font-bold text-blue-700">{text(item.status)}</span>
                    <span className={`rounded-full px-2 py-1 font-bold ${phase.badge}`}>{phase.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {activeTab === "group" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-600" />
              <h2 className="text-sm font-bold text-slate-800">Nhóm ca ({shiftGroups.length})</h2>
            </div>
            {add("group")}
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {shiftGroups.map((item) => {
              const id = Number(item.id ?? item.shiftGroupId ?? 0);
              return (
                <div key={id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-slate-800">{text(item.shiftGroupName, `Nhóm ca #${id}`)}</p>
                      <p className="mt-1 text-[11px] text-slate-500">{text(item.shiftGroupCode)}</p>
                    </div>
                    {actions("group", item as Record<string, unknown>)}
                  </div>
                  <p className="mt-3 text-[11px] text-slate-600">{text(item.description, "Không có mô tả")}</p>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-600">
                    <span className="rounded-full bg-emerald-100 px-2 py-1 font-bold text-emerald-700">{text(item.status)}</span>
                    <span>{text(item.payRate, "0đ")}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {activeTab === "event" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <h2 className="text-sm font-bold text-slate-800">Sự kiện đặc biệt ({specialEvents.length})</h2>
            </div>
            {add("event")}
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {specialEvents.map((item) => {
              const id = Number(item.id ?? item.eventId ?? 0);
              return (
                <div key={id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-slate-800">{text(item.eventName, `Sự kiện #${id}`)}</p>
                      <p className="mt-1 text-[11px] text-slate-500">{text(item.eventType)}</p>
                    </div>
                    {actions("event", item as Record<string, unknown>)}
                  </div>
                  <p className="mt-3 text-[11px] text-slate-600">{text(item.description, "Không có mô tả")}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-500">
                    <span className="rounded-full bg-slate-100 px-2 py-1">{date(item.startDate)}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-1">{date(item.endDate)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {activeTab === "emergency" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600" />
              <h2 className="text-sm font-bold text-slate-800">Yêu cầu khẩn cấp ({emergencyRequests.length})</h2>
            </div>
            {add("emergency")}
          </div>
          <div className="space-y-3">
            {emergencyRequests.map((item) => {
              const id = Number(item.id ?? item.emergencyRequestId ?? 0);
              return (
                <div key={id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-slate-800">{text(item.requestType, `Yêu cầu #${id}`)}</p>
                      <p className="mt-1 text-[11px] text-slate-500">Nhân viên #{text(item.employeeId, "—")}</p>
                    </div>
                    {actions("emergency", item as Record<string, unknown>)}
                  </div>
                  <p className="mt-3 text-[11px] text-slate-600">{text(item.reason, "Không có lý do")}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="rounded-full bg-rose-100 px-2 py-1 font-bold text-rose-700">{text(item.status)}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">Từ #{text(item.fromShiftAssignmentId, "—")}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">Đến #{text(item.toAssignmentId, "—")}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
