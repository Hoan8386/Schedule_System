"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, Calendar, Clock, Pencil, Plus, RefreshCw, Trash2, X } from "lucide-react";
import { managerApi, SchedulePeriodResponse, ShiftResponse, ShiftByDateResponse, ShiftAssignmentResponse, StoreResponse, EmployeeResponse } from "@/lib/managerApi";

const text = (value: unknown, fallback = "—") => value === null || value === undefined || value === "" ? fallback : String(value);
const idOf = (item: Record<string, unknown>) => Number(item.id ?? item.schedulePeriodId ?? item.shiftId ?? item.shiftByDateId ?? 0);
const date = (value: unknown) => value ? new Date(String(value)).toLocaleDateString("vi-VN") : "—";
const timeRange = (start: unknown, end: unknown) => `${text(start, "--:--")} – ${text(end, "--:--")}`;
type Kind = "period" | "shift" | "shiftDate" | "assignment";
type FormState = Record<string, string>;

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

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [periodResponse, shiftResponse, dateResponse, assignmentResponse, storeResponse, employeeResponse] = await Promise.all([
        managerApi.getSchedulePeriods(), managerApi.getShifts(), managerApi.getShiftsByDate({
          q: filters.q || undefined,
          from: filters.from || undefined,
          to: filters.to || undefined,
          storeId: filters.storeId ? Number(filters.storeId) : undefined,
          status: filters.status || undefined,
        }), managerApi.getShiftAssignments(),
        managerApi.getStores(), managerApi.getEmployees("ACTIVE"),
      ]);
      setPeriods(periodResponse.data ?? []); setShifts(shiftResponse.data ?? []); setShiftDates(dateResponse.data ?? []);
      setAssignments(assignmentResponse.data ?? []); setStores(storeResponse.data ?? []); setEmployees(employeeResponse.data ?? []);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể tải dữ liệu lịch"); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [filters]);

  const remove = async (kind: Kind, id: number) => {
    if (!id || !window.confirm("Bạn có chắc muốn xóa dữ liệu này?")) return;
    try {
      if (kind === "period") await managerApi.deleteSchedulePeriod(id);
      if (kind === "shift") await managerApi.deleteShift(id);
      if (kind === "shiftDate") await managerApi.deleteShiftByDate(id);
      if (kind === "assignment") await managerApi.deleteShiftAssignment(id);
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể xóa dữ liệu"); }
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!modal) return; setSaving(true); setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const body: Record<string, unknown> = { ...values };
    ["store", "shift", "schedulePeriod", "shiftByDate", "employee", "capacity", "maxCapacity", "payRate"].forEach((key) => {
      if (key in body && body[key] !== "") body[key] = Number(body[key]);
    });
    try {
      const id = modal.item ? idOf(modal.item) : 0;
      if (modal.kind === "period") id ? await managerApi.updateSchedulePeriod(id, body) : await managerApi.createSchedulePeriod(body);
      if (modal.kind === "shift") id ? await managerApi.updateShift(id, body) : await managerApi.createShift(body);
      if (modal.kind === "shiftDate") id ? await managerApi.updateShiftByDate(id, body) : await managerApi.createShiftByDate(body);
      if (modal.kind === "assignment") id ? await managerApi.updateShiftAssignment(id, body) : await managerApi.createShiftAssignment(body);
      setModal(null); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể lưu dữ liệu"); }
    finally { setSaving(false); }
  };

  const value = (key: string) => modal?.item?.[key] == null ? "" : String(modal.item[key]);
  const input = (name: string, label: string, type = "text", required = false) => (
    <label className="text-xs font-semibold text-slate-600">{label}<input name={name} type={type} required={required} defaultValue={value(name)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-hidden focus:border-amber-400" /></label>
  );
  const select = (name: string, label: string, options: { id: number; label: string }[], required = true) => (
    <label className="text-xs font-semibold text-slate-600">{label}<select name={name} required={required} defaultValue={value(name)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"><option value="">Chọn...</option>{options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
  );
  const storeOptions = stores.map((item) => ({ id: Number(item.id), label: text(item.storeName, `Cửa hàng #${item.id}`) }));
  const shiftOptions = shifts.map((item) => ({ id: Number(item.id), label: text(item.shiftName, `Ca #${item.id}`) }));
  const periodOptions = periods.map((item) => ({ id: Number(item.id), label: text(item.periodName, `Kỳ #${item.id}`) }));
  const shiftDateOptions = shiftDates.map((item) => ({ id: Number(item.id), label: `${text(item.shiftName, `Ca #${item.shiftByDateId}`)} - ${date(item.workDate)}` }));
  const employeeOptions = employees.map((item) => ({ id: Number(item.id), label: text(item.fullName, `NV #${item.id}`) }));
  const form = modal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" role="dialog" aria-modal="true"><form onSubmit={submit} className="w-full max-w-xl space-y-4 rounded-2xl bg-white p-6 shadow-2xl">
    <div className="flex items-center justify-between"><h2 className="text-lg font-black text-slate-800">{modal.item ? "Chỉnh sửa" : "Thêm"} {modal.kind === "period" ? "kỳ lập lịch" : modal.kind === "shift" ? "ca mẫu" : modal.kind === "shiftDate" ? "ca theo ngày" : "phân công"}</h2><button type="button" onClick={() => setModal(null)} aria-label="Đóng"><X /></button></div>
    <div className="grid gap-3 sm:grid-cols-2">
      {modal.kind === "period" && <>{select("store", "Cửa hàng", storeOptions)}{input("periodName", "Tên kỳ", "text", true)}{input("periodType", "Loại kỳ", "text", true)}{input("startDate", "Ngày bắt đầu", "date", true)}{input("endDate", "Ngày kết thúc", "date", true)}{input("registrationOpenAt", "Mở đăng ký", "datetime-local")}{input("registrationCloseAt", "Đóng đăng ký", "datetime-local")}{input("status", "Trạng thái", "text", true)}</>}
      {modal.kind === "shift" && <>{select("store", "Cửa hàng", storeOptions)}{input("shiftCode", "Mã ca", "text", true)}{input("shiftName", "Tên ca", "text", true)}{input("startTime", "Bắt đầu", "time", true)}{input("endTime", "Kết thúc", "time", true)}{input("maxCapacity", "Sức chứa", "number", true)}{input("payRate", "Lương theo giờ", "number")}{input("status", "Trạng thái", "text", true)}</>}
      {modal.kind === "shiftDate" && <>{select("shift", "Ca mẫu", shiftOptions)}{select("schedulePeriod", "Kỳ lập lịch", periodOptions, false)}{input("workDate", "Ngày làm", "date", true)}{input("capacity", "Số lượng", "number")}{input("shiftName", "Tên ca hiển thị")}{input("startTime", "Bắt đầu", "time")}{input("endTime", "Kết thúc", "time")}{input("status", "Trạng thái", "text", true)}</>}
      {modal.kind === "assignment" && <>{select("shiftByDate", "Ca theo ngày", shiftDateOptions)}{select("employee", "Nhân viên", employeeOptions)}{input("status", "Trạng thái", "text", true)}{input("note", "Ghi chú")}</>}
    </div><button disabled={saving} className="w-full rounded-xl bg-amber-500 px-4 py-3 text-sm font-black text-slate-900 disabled:opacity-50">{saving ? "Đang lưu..." : "Lưu dữ liệu"}</button>
  </form></div>;

  const actions = (kind: Kind, item: Record<string, unknown>) => <div className="flex gap-2"><button onClick={() => setModal({ kind, item })} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50" aria-label="Chỉnh sửa"><Pencil className="h-4 w-4" /></button><button onClick={() => void remove(kind, idOf(item))} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50" aria-label="Xóa"><Trash2 className="h-4 w-4" /></button></div>;
  const add = (kind: Kind) => <button onClick={() => setModal({ kind })} className="ml-auto inline-flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-2 text-xs font-black text-slate-900"><Plus className="h-4 w-4" /> Thêm</button>;

  return <div className="mx-auto max-w-7xl space-y-6 p-6">{form}<header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h1 className="text-2xl font-black text-slate-800">Quản lý lịch & ca làm việc</h1><p className="mt-1 text-xs text-slate-500">Dữ liệu trực tiếp từ API Module 3.</p></div><button onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Làm mới</button></header>
    {error && <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700"><AlertCircle className="h-4 w-4" />{error}</div>}
    <section className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
      <label className="min-w-56 flex-1 text-xs font-semibold text-slate-600">Tìm ca
        <input value={filters.q} onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))} placeholder="Tên ca hoặc mã ca" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-hidden focus:border-amber-400" />
      </label>
      <label className="text-xs font-semibold text-slate-600">Từ ngày
        <input type="date" value={filters.from} onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))} className="mt-1 rounded-xl border border-slate-200 px-3 py-2 text-sm" />
      </label>
      <label className="text-xs font-semibold text-slate-600">Đến ngày
        <input type="date" value={filters.to} onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))} className="mt-1 rounded-xl border border-slate-200 px-3 py-2 text-sm" />
      </label>
      <label className="text-xs font-semibold text-slate-600">Trạng thái
        <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} className="mt-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"><option value="">Tất cả</option><option value="ACTIVE">Đang hoạt động</option><option value="INACTIVE">Ngừng hoạt động</option></select>
      </label>
      <button type="button" onClick={() => setFilters({ q: "", from: "", to: "", storeId: "", status: "" })} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">Xóa bộ lọc</button>
    </section>
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs"><div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4"><Calendar className="h-4 w-4 text-amber-600" /><h2 className="text-sm font-bold text-slate-800">Kỳ lập lịch ({periods.length})</h2>{add("period")}</div><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 text-[11px] uppercase text-slate-400"><tr><th className="px-5 py-3">Tên kỳ</th><th className="px-5 py-3">Thời gian</th><th className="px-5 py-3">Trạng thái</th><th /></tr></thead><tbody className="divide-y divide-slate-100">{periods.map((item) => <tr key={idOf(item as Record<string, unknown>)}><td className="px-5 py-4 font-bold">{text(item.periodName)}</td><td className="px-5 py-4">{date(item.startDate)} – {date(item.endDate)}</td><td className="px-5 py-4">{text(item.status)}</td><td className="px-5 py-4">{actions("period", item as Record<string, unknown>)}</td></tr>)}</tbody></table></div></section>
    <div className="grid gap-5 lg:grid-cols-2"><section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs"><div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4"><Clock className="h-4 w-4 text-blue-600" /><h2 className="text-sm font-bold">Ca mẫu ({shifts.length})</h2>{add("shift")}</div><div className="divide-y divide-slate-100">{shifts.map((item) => <div key={idOf(item as Record<string, unknown>)} className="flex items-center justify-between gap-3 px-5 py-4"><div><p className="text-sm font-bold">{text(item.shiftName, text(item.shiftCode))}</p><p className="text-xs text-slate-500">{timeRange(item.startTime, item.endTime)}</p></div>{actions("shift", item as Record<string, unknown>)}</div>)}</div></section>
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs"><div className="flex items-center border-b border-slate-100 px-5 py-4"><h2 className="text-sm font-bold">Ca theo ngày ({shiftDates.length})</h2>{add("shiftDate")}</div><div className="divide-y divide-slate-100">{shiftDates.map((item) => <div key={idOf(item as Record<string, unknown>)} className="flex items-center justify-between gap-3 px-5 py-4"><div><p className="text-sm font-bold">{text(item.shiftName, `Ca #${text(item.shiftId)}`)}</p><p className="text-xs text-slate-500">{date(item.workDate)} · {timeRange(item.startTime, item.endTime)}</p></div>{actions("shiftDate", item as Record<string, unknown>)}</div>)}</div></section></div>
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs"><div className="flex items-center border-b border-slate-100 px-5 py-4"><h2 className="text-sm font-bold">Phân công ca ({assignments.length})</h2>{add("assignment")}</div><div className="divide-y divide-slate-100">{assignments.map((item) => <div key={idOf(item as Record<string, unknown>)} className="flex items-center justify-between px-5 py-4 text-xs"><span>Nhân viên #{text(item.employeeId)} · Ca #{text(item.shiftByDateId)} · {text(item.status)}</span>{actions("assignment", item as Record<string, unknown>)}</div>)}</div></section>
  </div>;
}
