"use client";

import React, { useCallback, useState } from "react";
import { useDebouncedValue, useInitialLoad, usePagedList } from "@/lib/hooks";
import { AlertCircle, CheckCircle2, Clock, LogIn, Pencil, Plus, RefreshCw, Search, Trash2, UserX, X } from "lucide-react";
import { AttendanceResponse, EmployeeResponse, managerApi } from "@/lib/api";
import { Pagination } from "@/components/ui";

/** Số bản ghi chấm công mỗi trang. */
const PAGE_SIZE = 10;

const text = (value: unknown, fallback = "—") =>
  value === null || value === undefined || value === "" ? fallback : String(value);
const employeeIdOf = (item: AttendanceResponse) =>
  typeof item.employee === "object" && item.employee ? item.employee.id : item.employeeId;
const employeeNameOf = (item: AttendanceResponse) =>
  typeof item.employee === "object" && item.employee
    ? item.employee.fullName || `Nhân viên #${text(item.employee.id)}`
    : `Nhân viên #${text(employeeIdOf(item))}`;
const shiftDateOf = (item: AttendanceResponse) =>
  typeof item.shiftByDate === "object" && item.shiftByDate ? item.shiftByDate.workDate : null;
const formatTime = (value: unknown) =>
  value ? new Date(String(value)).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "—";
const formatDate = (value: unknown) =>
  value ? new Date(String(value)).toLocaleDateString("vi-VN") : "—";

export default function ChamCongPage() {
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [checkingIn, setCheckingIn] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [modal, setModal] = useState<AttendanceResponse | "create" | null>(null);

  // Tìm kiếm / lọc / phân trang tại backend, mới nhất trước
  const keyword = useDebouncedValue(search.trim());
  const fetchPage = useCallback(
    (page: number, signal: AbortSignal) =>
      managerApi.getAttendancePage({ page, size: PAGE_SIZE, q: keyword || undefined, status: status === "ALL" ? undefined : status }, signal),
    [keyword, status]
  );
  const { items: filtered, meta, summary, setPage, loading, error, setError, reload } = usePagedList(fetchPage);

  // Danh sách nhân viên cho ô chọn check-in / form – chỉ tải một lần
  useInitialLoad(async () => {
    try {
      const { data } = await managerApi.getEmployees("ACTIVE");
      setEmployees(data ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tải danh sách nhân viên");
    }
  });

  const checkIn = async () => {
    if (!employeeId) {
      setError("Vui lòng chọn nhân viên trước khi check-in");
      return;
    }
    setCheckingIn(true);
    setError("");
    setMessage("");
    try {
      await managerApi.checkIn({ employeeId: Number(employeeId) });
      setMessage("Check-in thành công");
      reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể check-in");
    } finally {
      setCheckingIn(false);
    }
  };

  const checkOut = async (item: AttendanceResponse) => {
    if (!item.id) return;
    setUpdatingId(item.id);
    setError("");
    setMessage("");
    try {
      await managerApi.updateAttendance(item.id, {
        checkOutAt: new Date().toISOString(),
        attendanceStatus: item.attendanceStatus ?? "PRESENT",
        approvalStatus: item.approvalStatus ?? "PENDING",
        note: item.note ?? null,
      });
      setMessage("Check-out thành công");
      reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể check-out");
    } finally {
      setUpdatingId(null);
    }
  };

  const saveAttendance = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const body = {
      employeeId: Number(values.employeeId),
      checkOutAt: values.checkOutAt ? new Date(String(values.checkOutAt)).toISOString() : null,
      attendanceStatus: String(values.attendanceStatus),
      approvalStatus: String(values.approvalStatus),
      note: String(values.note || ""),
    };
    try {
      if (modal && modal !== "create" && modal.id) {
        await managerApi.updateAttendance(modal.id, body);
      } else {
        await managerApi.createAttendance(body);
      }
      setModal(null);
      setMessage("Lưu chấm công thành công");
      reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể lưu chấm công");
    }
  };

  const deleteAttendance = async (item: AttendanceResponse) => {
    if (!item.id || !window.confirm("Bạn có chắc muốn xóa bản ghi chấm công này?")) return;
    try {
      await managerApi.deleteAttendance(item.id);
      setMessage("Đã xóa bản ghi chấm công");
      reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể xóa chấm công");
    }
  };

  const editing = modal && modal !== "create" ? modal : null;
  const employeeOf = editing ? employeeIdOf(editing) : "";
  const attendanceForm = modal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <form onSubmit={saveAttendance} className="max-h-[92dvh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl bg-white p-4 sm:p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-800">{editing ? "Chỉnh sửa chấm công" : "Thêm chấm công"}</h2>
          <button type="button" onClick={() => setModal(null)} aria-label="Đóng"><X /></button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold text-slate-600">Nhân viên
            <select name="employeeId" required defaultValue={String(employeeOf ?? "")} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <option value="">Chọn nhân viên</option>
              {employees.map((employee) => <option key={employee.id} value={employee.id}>{text(employee.fullName, `#${employee.id}`)}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600">Check-out
            <input name="checkOutAt" type="datetime-local" defaultValue={editing?.checkOutAt ? String(editing.checkOutAt).slice(0, 16) : ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <label className="text-xs font-semibold text-slate-600">Trạng thái
            <select name="attendanceStatus" defaultValue={editing?.attendanceStatus ?? "PRESENT"} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"><option>PRESENT</option><option>ABSENT</option><option>LATE</option></select>
          </label>
          <label className="text-xs font-semibold text-slate-600">Duyệt
            <select name="approvalStatus" defaultValue={editing?.approvalStatus ?? "PENDING"} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"><option>PENDING</option><option>APPROVED</option><option>REJECTED</option></select>
          </label>
          <label className="text-xs font-semibold text-slate-600 sm:col-span-2">Ghi chú
            <textarea name="note" defaultValue={editing?.note ?? ""} rows={3} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </label>
        </div>
        <button className="w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-black text-slate-900">Lưu chấm công</button>
      </form>
    </div>
  );

  // Thống kê toàn bộ phạm vi do backend đếm (không phụ thuộc trang đang xem)
  const pending = summary?.pendingCheckout ?? 0;
  const absent = summary?.absent ?? 0;
  const violations = summary?.violations ?? 0;

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 sm:space-y-6 sm:p-6">{attendanceForm}
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Quản lý chấm công</h1>
          <p className="text-xs text-slate-500 mt-1">Theo dõi và ghi nhận attendance trực tiếp qua API.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <select value={employeeId} onChange={(event) => setEmployeeId(event.target.value)} className="min-w-56 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium">
            <option value="">Chọn nhân viên check-in</option>
            {employees.map((employee) => <option key={employee.id} value={employee.id}>{text(employee.fullName, employee.employeeCode ?? `#${employee.id}`)}</option>)}
          </select>
          <button onClick={() => void checkIn()} disabled={checkingIn || loading} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 text-slate-900 text-xs font-bold disabled:opacity-50">
            <LogIn className="w-4 h-4" /> {checkingIn ? "Đang ghi nhận..." : "Check-in"}
          </button>
          <button onClick={() => setModal("create")} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-brand-300 bg-brand-50 text-brand-800 text-xs font-bold"><Plus className="w-4 h-4" /> Thêm thủ công</button>
          <button onClick={reload} disabled={loading} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Làm mới
          </button>
        </div>
      </header>

      {error && <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
      {message && <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-700"><CheckCircle2 className="w-4 h-4 shrink-0" />{message}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between"><div><p className="text-xs text-slate-500">Tổng bản ghi</p><p className="text-2xl font-black text-slate-800">{summary?.total ?? 0}</p></div><Clock className="w-5 h-5 text-brand-600" /></div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between"><div><p className="text-xs text-slate-500">Chờ check-out</p><p className="text-2xl font-black text-slate-800">{pending}</p></div><Clock className="w-5 h-5 text-blue-600" /></div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between"><div><p className="text-xs text-slate-500">Vắng / vi phạm</p><p className="text-2xl font-black text-slate-800">{absent + violations}</p></div><UserX className="w-5 h-5 text-rose-600" /></div>
      </div>

      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 max-w-sm"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên hoặc mã nhân viên..." className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs outline-hidden focus:border-brand-400" /></div>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"><option value="ALL">Tất cả trạng thái</option><option value="PRESENT">Có mặt</option><option value="ABSENT">Vắng</option><option value="LATE">Đi muộn</option></select>
        </div>
        <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 text-[11px] text-slate-400 uppercase"><tr><th className="px-4 py-3">Nhân viên</th><th className="px-4 py-3">Ngày</th><th className="px-4 py-3">Ca</th><th className="px-4 py-3">Check-in</th><th className="px-4 py-3">Check-out</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Thao tác</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{loading && filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">Đang tải dữ liệu chấm công...</td></tr>}{!loading && filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">{summary?.total ? "Không có bản ghi phù hợp bộ lọc" : "Chưa có dữ liệu chấm công"}</td></tr>}{filtered.map((item, index) => <tr key={String(item.id ?? index)}><td className="px-4 py-4"><p className="font-bold text-slate-800">{employeeNameOf(item)}</p><p className="text-[11px] text-slate-400">#{text(employeeIdOf(item))}</p></td><td className="px-4 py-4 text-slate-600">{formatDate(shiftDateOf(item) ?? item.checkInAt ?? item.checkOutAt)}</td><td className="px-4 py-4 text-slate-600">#{text(typeof item.shiftByDate === "object" && item.shiftByDate ? item.shiftByDate.id : item.shiftByDateId)}</td><td className="px-4 py-4 font-bold text-slate-700">{formatTime(item.checkInAt)}</td><td className="px-4 py-4 text-slate-600">{formatTime(item.checkOutAt)}</td><td className="px-4 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-700">{text(item.attendanceStatus)}</span></td><td className="px-4 py-4"><div className="flex items-center gap-1">{!item.checkOutAt && <button onClick={() => void checkOut(item)} disabled={updatingId === item.id} className="rounded-xl bg-brand-500 px-3 py-1.5 font-bold text-slate-900 disabled:opacity-50">{updatingId === item.id ? "Đang lưu..." : "Check-out"}</button>}<button onClick={() => setModal(item)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50" aria-label="Chỉnh sửa"><Pencil className="h-4 w-4" /></button><button onClick={() => void deleteAttendance(item)} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50" aria-label="Xóa"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}</tbody>
        </table></div>
        <Pagination meta={meta} onPageChange={setPage} disabled={loading} />
      </section>
    </div>
  );
}
