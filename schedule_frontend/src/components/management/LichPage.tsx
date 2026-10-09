"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Award,
  Calendar,
  CalendarRange,
  Clock3,
  ListFilter,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  managerApi,
  SchedulePeriodResponse,
  ShiftAssignmentResponse,
  ShiftByDateResponse,
  ShiftResponse,
  StoreResponse,
  EmployeeResponse,
} from "@/lib/managerApi";

const text = (value: unknown, fallback = "—") =>
  value === null || value === undefined || value === "" ? fallback : String(value);

const idOf = (item: Record<string, unknown>) =>
  Number(item.id ?? item.schedulePeriodId ?? item.shiftId ?? item.shiftByDateId ?? item.shiftAssignmentId ?? 0);

const date = (value: unknown) =>
  value ? new Date(String(value)).toLocaleDateString("vi-VN") : "—";

const timeRange = (start: unknown, end: unknown) =>
  `${text(start, "--:--")} – ${text(end, "--:--")}`;

const dayKey = (value: string | null | undefined) => {
  if (!value) return "";
  const safe = new Date(value);
  if (Number.isNaN(safe.getTime())) return "";
  return safe.toISOString().slice(0, 10);
};

type TabKey = "period" | "shift" | "calendar";
type Kind = "period" | "shift" | "shiftDate" | "assignment";

export default function LichPage() {
  const [periods, setPeriods] = useState<SchedulePeriodResponse[]>([]);
  const [shifts, setShifts] = useState<ShiftResponse[]>([]);
  const [shiftDates, setShiftDates] = useState<ShiftByDateResponse[]>([]);
  const [assignments, setAssignments] = useState<ShiftAssignmentResponse[]>([]);
  const [stores, setStores] = useState<StoreResponse[]>([]);
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<{ kind: Kind; item?: Record<string, unknown> } | null>(null);
  const [filters, setFilters] = useState({ q: "", from: "", to: "", storeId: "", status: "" });
  const [activeTab, setActiveTab] = useState<TabKey>("period");
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);
  const [calendarDetail, setCalendarDetail] = useState<{
    date: string;
    items: Array<{
      shiftByDateId: number;
      title: string;
      time: string;
      employees: Array<{ employeeId: number; fullName: string; status: string }>; 
    }>;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [periodResponse, shiftResponse, dateResponse, assignmentResponse, storeResponse, employeeResponse] = await Promise.all([
        managerApi.getSchedulePeriods({
          q: filters.q || undefined,
          from: filters.from || undefined,
          to: filters.to || undefined,
          storeId: filters.storeId ? Number(filters.storeId) : undefined,
          status: filters.status || undefined,
        }),
        managerApi.getShifts(),
        managerApi.getShiftsByDate({
          q: filters.q || undefined,
          from: filters.from || undefined,
          to: filters.to || undefined,
          storeId: filters.storeId ? Number(filters.storeId) : undefined,
          status: filters.status || undefined,
        }),
        managerApi.getShiftAssignments(),
        managerApi.getStores(),
        managerApi.getEmployees("ACTIVE"),
      ]);

      setPeriods(periodResponse.data ?? []);
      setShifts(shiftResponse.data ?? []);
      setShiftDates(dateResponse.data ?? []);
      setAssignments(assignmentResponse.data ?? []);
      setStores(storeResponse.data ?? []);
      setEmployees(employeeResponse.data ?? []);

      if (!selectedPeriodId && (periodResponse.data?.length ?? 0) > 0) {
        setSelectedPeriodId(Number((periodResponse.data ?? [])[0].id ?? (periodResponse.data ?? [])[0].schedulePeriodId));
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tải dữ liệu lịch");
    } finally {
      setLoading(false);
    }
  }, [filters.from, filters.q, filters.status, filters.storeId, filters.to, selectedPeriodId]);

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

  const assignmentsByShiftDate = useMemo(() => {
    const map = new Map<number, ShiftAssignmentResponse[]>();
    assignments.forEach((assignment) => {
      const shiftId = Number(assignment.shiftByDateId ?? 0);
      if (!shiftId) return;
      const next = map.get(shiftId) ?? [];
      next.push(assignment);
      map.set(shiftId, next);
    });
    return map;
  }, [assignments]);

  const periodDetails = useMemo(() => {
    return periods.map((period) => {
      const periodId = Number(period.id ?? period.schedulePeriodId ?? 0);
      const entries = shiftDates.filter((item) => Number(item.schedulePeriodId ?? 0) === periodId);
      const employeesForPeriod = new Set<number>();

      entries.forEach((entry) => {
        const shiftAssignments = assignmentsByShiftDate.get(Number(entry.id ?? entry.shiftByDateId ?? 0)) ?? [];
        shiftAssignments.forEach((assignment) => {
          if (assignment.employeeId) employeesForPeriod.add(Number(assignment.employeeId));
        });
      });

      return {
        periodId,
        periodName: text(period.periodName),
        startDate: date(period.startDate),
        endDate: date(period.endDate),
        totalEmployees: employeesForPeriod.size,
        entries,
      };
    });
  }, [periods, shiftDates, assignmentsByShiftDate]);

  const selectedPeriod = periodDetails.find((item) => item.periodId === selectedPeriodId) ?? periodDetails[0];

  const calendarDates = useMemo(() => {
    const dates = shiftDates
      .map((item) => dayKey(item.workDate ? String(item.workDate) : ""))
      .filter(Boolean)
      .sort();

    if (dates.length === 0) return [];

    const start = new Date(`${dates[0]}T00:00:00`);
    const end = new Date(`${dates[dates.length - 1]}T00:00:00`);
    const diff = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1);
    return Array.from({ length: diff }, (_, index) => {
      const current = new Date(start);
      current.setDate(start.getDate() + index);
      return current;
    });
  }, [shiftDates]);

  const calendarMap = useMemo(() => {
    const map = new Map<string, { count: number; items: ShiftByDateResponse[] }>();

    shiftDates.forEach((shiftDate) => {
      const key = dayKey(shiftDate.workDate ? String(shiftDate.workDate) : "");
      if (!key) return;
      const entry = map.get(key) ?? { count: 0, items: [] };
      entry.items.push(shiftDate);
      const shiftId = Number(shiftDate.id ?? shiftDate.shiftByDateId ?? 0);
      const workers = assignmentsByShiftDate.get(shiftId) ?? [];
      entry.count += workers.length;
      map.set(key, entry);
    });

    return map;
  }, [shiftDates, assignmentsByShiftDate]);

  const remove = async (kind: Kind, id: number) => {
    if (!id || !window.confirm("Bạn có chắc muốn xóa dữ liệu này?")) return;
    try {
      if (kind === "period") await managerApi.deleteSchedulePeriod(id);
      if (kind === "shift") await managerApi.deleteShift(id);
      if (kind === "shiftDate") await managerApi.deleteShiftByDate(id);
      if (kind === "assignment") await managerApi.deleteShiftAssignment(id);
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
    ["store", "shift", "schedulePeriod", "shiftByDate", "employee", "capacity", "maxCapacity", "payRate"].forEach((key) => {
      if (key in body && body[key] !== "") body[key] = Number(body[key]);
    });

    try {
      const id = modal.item ? idOf(modal.item) : 0;
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
      setModal(null);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể lưu dữ liệu");
    } finally {
      setSaving(false);
    }
  };

  const value = (key: string) => (modal?.item?.[key] == null ? "" : String(modal.item[key]));

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

  const storeOptions = stores.map((item) => ({ id: Number(item.id), label: text(item.storeName, `Cửa hàng #${item.id}`) }));
  const shiftOptions = shifts.map((item) => ({ id: Number(item.id), label: text(item.shiftName, `Ca #${item.id}`) }));
  const periodOptions = periods.map((item) => ({ id: Number(item.id ?? item.schedulePeriodId ?? 0), label: text(item.periodName, `Kỳ #${item.id ?? item.schedulePeriodId ?? 0}`) }));
  const shiftDateOptions = shiftDates.map((item) => ({ id: Number(item.id ?? item.shiftByDateId ?? 0), label: `${text(item.shiftName, `Ca #${item.shiftId}`)} - ${date(item.workDate)}` }));
  const employeeOptions = employees.map((item) => ({ id: Number(item.id), label: text(item.fullName, `NV #${item.id}`) }));

  const form = modal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" role="dialog" aria-modal="true">
      <form onSubmit={submit} className="w-full max-w-xl space-y-4 rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-800">
            {modal.item ? "Chỉnh sửa" : "Thêm"} {modal.kind === "period" ? "kỳ lập lịch" : modal.kind === "shift" ? "ca mẫu" : modal.kind === "shiftDate" ? "ca theo ngày" : "phân công"}
          </h2>
          <button type="button" onClick={() => setModal(null)} aria-label="Đóng" className="rounded-full p-2 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {modal.kind === "period" && (
            <>
              {select("store", "Cửa hàng", storeOptions)}
              {input("periodName", "Tên kỳ", "text", true)}
              {input("periodType", "Loại kỳ", "text", true)}
              {input("startDate", "Ngày bắt đầu", "date", true)}
              {input("endDate", "Ngày kết thúc", "date", true)}
              {input("registrationOpenAt", "Mở đăng ký", "datetime-local")}
              {input("registrationCloseAt", "Đóng đăng ký", "datetime-local")}
              {input("status", "Trạng thái", "text", true)}
            </>
          )}

          {modal.kind === "shift" && (
            <>
              {select("store", "Cửa hàng", storeOptions)}
              {input("shiftCode", "Mã ca", "text", true)}
              {input("shiftName", "Tên ca", "text", true)}
              {input("startTime", "Bắt đầu", "time", true)}
              {input("endTime", "Kết thúc", "time", true)}
              {input("maxCapacity", "Sức chứa", "number", true)}
              {input("payRate", "Lương theo giờ", "number")}
              {input("status", "Trạng thái", "text", true)}
            </>
          )}

          {modal.kind === "shiftDate" && (
            <>
              {select("shift", "Ca mẫu", shiftOptions)}
              {select("schedulePeriod", "Kỳ lập lịch", periodOptions, false)}
              {input("workDate", "Ngày làm", "date", true)}
              {input("capacity", "Số lượng", "number")}
              {input("shiftName", "Tên ca hiển thị")}
              {input("startTime", "Bắt đầu", "time")}
              {input("endTime", "Kết thúc", "time")}
              {input("status", "Trạng thái", "text", true)}
            </>
          )}

          {modal.kind === "assignment" && (
            <>
              {select("shiftByDate", "Ca theo ngày", shiftDateOptions)}
              {select("employee", "Nhân viên", employeeOptions)}
              {input("status", "Trạng thái", "text", true)}
              {input("note", "Ghi chú")}
            </>
          )}
        </div>

        <button disabled={saving} className="w-full rounded-xl bg-amber-500 px-4 py-3 text-sm font-black text-slate-900 disabled:opacity-50">
          {saving ? "Đang lưu..." : "Lưu dữ liệu"}
        </button>
      </form>
    </div>
  );

  const actions = (kind: Kind, item: Record<string, unknown>) => (
    <div className="flex gap-2">
      <button onClick={() => setModal({ kind, item })} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50" aria-label="Chỉnh sửa">
        <Pencil className="h-4 w-4" />
      </button>
      <button onClick={() => void remove(kind, idOf(item))} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50" aria-label="Xóa">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  const add = (kind: Kind) => (
    <button onClick={() => setModal({ kind })} className="ml-auto inline-flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-2 text-xs font-black text-slate-900">
      <Plus className="h-4 w-4" /> Thêm
    </button>
  );

  const handleAction = (shiftByDateId: number, employeeId: number, action: "reward" | "penalty") => {
    const note = action === "reward" ? "Thưởng trực tiếp" : "Phạt trực tiếp";

    setAssignments((current) =>
      current.map((assignment) => {
        if (Number(assignment.shiftByDateId) !== shiftByDateId || Number(assignment.employeeId) !== employeeId) return assignment;
        return { ...assignment, status: action === "reward" ? "REWARD" : "PENALTY", note };
      })
    );
  };

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
              Cửa hàng
              <select
                value={filters.storeId}
                onChange={(event) => setFilters((current) => ({ ...current, storeId: event.target.value }))}
                className="mt-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">Tất cả cửa hàng</option>
                {stores.map((store) => (
                  <option key={store.id} value={String(store.id)}>{text(store.storeName, `Cửa hàng #${store.id}`)}</option>
                ))}
              </select>
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
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="INACTIVE">Ngừng hoạt động</option>
              </select>
            </label>
            <button type="button" onClick={() => setFilters({ q: "", from: "", to: "", storeId: "", status: "" })} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
              Xóa bộ lọc
            </button>
          </section>

          <section className="grid gap-5 lg:grid-cols-[1.1fr_1.3fr]">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
                <CalendarRange className="h-4 w-4 text-amber-600" />
                <h2 className="text-sm font-bold text-slate-800">Tất cả kỳ ({periods.length})</h2>
                {add("period")}
              </div>
              <div className="divide-y divide-slate-100">
                {periods.map((item) => {
                  const id = Number(item.id ?? item.schedulePeriodId ?? 0);
                  const isSelected = id === (selectedPeriod?.periodId ?? 0);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSelectedPeriodId(id)}
                      className={`flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition ${isSelected ? "bg-amber-50" : "hover:bg-slate-50"}`}
                    >
                      <div>
                        <p className="text-sm font-black text-slate-800">{text(item.periodName)}</p>
                        <p className="mt-1 text-[11px] text-slate-500">{date(item.startDate)} – {date(item.endDate)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">{text(item.status)}</span>
                        {actions("period", item as Record<string, unknown>)}
                      </div>
                    </button>
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
                    <span className="rounded-full bg-slate-100 px-2 py-1">{selectedPeriod.startDate}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-1">{selectedPeriod.endDate}</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">{selectedPeriod.totalEmployees} nhân viên</span>
                  </div>

                  <div className="space-y-3">
                    {selectedPeriod.entries.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 p-4 text-xs text-slate-500">Chưa có ca nào trong kỳ này.</div>
                    ) : (
                      selectedPeriod.entries.map((entry) => {
                        const entryId = Number(entry.id ?? entry.shiftByDateId ?? 0);
                        const workers = assignmentsByShiftDate.get(entryId) ?? [];
                        const employeeNames = workers
                          .map((assignment) => {
                            const employee = employeeMap.get(Number(assignment.employeeId ?? 0));
                            return employee?.fullName || `NV #${assignment.employeeId}`;
                          })
                          .filter(Boolean);

                        return (
                          <button
                            key={entryId}
                            type="button"
                            onClick={() => setCalendarDetail({
                              date: date(entry.workDate),
                              items: [{
                                shiftByDateId: entryId,
                                title: text(entry.shiftName, `Ca #${entryId}`),
                                time: timeRange(entry.startTime, entry.endTime),
                                employees: employeeNames.map((name, index) => ({
                                  employeeId: Number(workers[index]?.employeeId ?? 0),
                                  fullName: name,
                                  status: text(workers[index]?.status, "ACTIVE"),
                                })),
                              }],
                            })}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-left hover:border-amber-300 hover:bg-amber-50"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-bold text-slate-800">{text(entry.shiftName, `Ca #${entryId}`)}</p>
                                <p className="text-[11px] text-slate-500">{date(entry.workDate)} · {timeRange(entry.startTime, entry.endTime)}</p>
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
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
            <Clock3 className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-800">Danh sách Shift ({shifts.length})</h2>
            {add("shift")}
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            {shifts.map((item) => (
              <div key={Number(item.id ?? item.shiftId ?? 0)} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-slate-800">{text(item.shiftName, text(item.shiftCode))}</p>
                    <p className="mt-1 text-[11px] text-slate-500">{timeRange(item.startTime, item.endTime)}</p>
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
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <ListFilter className="h-4 w-4 text-amber-600" />
                <h2 className="text-sm font-bold text-slate-800">Thời khóa biểu ca làm</h2>
              </div>
              <label className="ml-auto min-w-47.5 text-[11px] font-semibold text-slate-600">
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
            </div>

            {calendarDates.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-5 text-xs text-slate-500">Chưa có dữ liệu lịch trong khoảng thời gian hiện tại.</div>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 7 }, (_, index) => (
                  <div key={`head-${index}`} className="px-2 py-2 text-center text-[11px] font-bold uppercase text-slate-500">
                    {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][index]}
                  </div>
                ))}

                {calendarDates.map((day, index) => {
                  const key = day.toISOString().slice(0, 10);
                  const count = calendarMap.get(key)?.count ?? 0;
                  const items = calendarMap.get(key)?.items ?? [];

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setCalendarDetail({
                          date: date(day.toISOString()),
                          items: items.map((entry) => {
                            const assignmentsForShift = assignmentsByShiftDate.get(Number(entry.id ?? entry.shiftByDateId ?? 0)) ?? [];
                            return {
                              shiftByDateId: Number(entry.id ?? entry.shiftByDateId ?? 0),
                              title: text(entry.shiftName, `Ca #${entry.shiftId ?? entry.shiftByDateId ?? ""}`),
                              time: timeRange(entry.startTime, entry.endTime),
                              employees: assignmentsForShift.map((assignment) => ({
                                employeeId: Number(assignment.employeeId ?? 0),
                                fullName: employeeMap.get(Number(assignment.employeeId ?? 0))?.fullName || `NV #${assignment.employeeId}`,
                                status: text(assignment.status, "ACTIVE"),
                              })),
                            };
                          }),
                        });
                      }}
                      className={`min-h-29.5 rounded-2xl border p-2 text-left transition ${
                        index % 7 === 0 ? "border-rose-200 bg-rose-50" : "border-slate-200 bg-slate-50 hover:border-amber-300 hover:bg-amber-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-slate-800">{day.getDate()}</span>
                        {count > 0 && <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">{count}</span>}
                      </div>
                      <div className="mt-3 space-y-1 text-[10px] text-slate-600">
                        {items.slice(0, 2).map((item) => (
                          <div key={Number(item.id ?? item.shiftByDateId ?? 0)} className="rounded-lg bg-white px-2 py-1">
                            {text(item.shiftName, `Ca #${item.shiftId}`)}
                          </div>
                        ))}
                        {items.length > 2 && <div className="text-[10px] font-semibold text-slate-500">+{items.length - 2} ca</div>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {calendarDetail && (
            <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50">
              <div className="h-full w-full max-w-xl overflow-y-auto bg-white p-5 shadow-2xl">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Chi tiết ca</p>
                    <h3 className="text-xl font-black text-slate-800">{calendarDetail.date}</h3>
                  </div>
                  <button type="button" onClick={() => setCalendarDetail(null)} className="rounded-full p-2 hover:bg-slate-100">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {calendarDetail.items.map((item) => (
                    <div key={item.shiftByDateId} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-base font-black text-slate-800">{item.title}</p>
                          <p className="text-xs text-slate-500">{item.time}</p>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700">{item.employees.length} NV</span>
                      </div>

                      <div className="mt-4 space-y-2">
                        {item.employees.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-slate-200 p-3 text-xs text-slate-500">Chưa có nhân viên được phân công.</div>
                        ) : (
                          item.employees.map((employee) => (
                            <div key={`${item.shiftByDateId}-${employee.employeeId}`} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">
                              <div>
                                <p className="text-sm font-bold text-slate-800">{employee.fullName}</p>
                                <p className="text-[11px] text-slate-500">{text(employee.status, "ACTIVE")}</p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleAction(item.shiftByDateId, employee.employeeId, "reward")}
                                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2 py-1.5 text-[11px] font-bold text-emerald-700"
                                >
                                  <Award className="h-3.5 w-3.5" />
                                  Thưởng
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAction(item.shiftByDateId, employee.employeeId, "penalty")}
                                  className="inline-flex items-center gap-1 rounded-lg bg-rose-100 px-2 py-1.5 text-[11px] font-bold text-rose-700"
                                >
                                  <AlertTriangle className="h-3.5 w-3.5" />
                                  Phạt
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
