"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, Check, Pencil, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";
import { EmergencyRequestResponse, managerApi } from "@/lib/managerApi";

const text = (value: unknown, fallback = "—") => value === null || value === undefined || value === "" ? fallback : String(value);
const requestId = (item: EmergencyRequestResponse) => Number(item.id ?? item.emergencyRequestId ?? 0);
const label = (value: unknown) => text(value).replaceAll("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

export default function YeuCauPage() {
  const [requests, setRequests] = useState<EmergencyRequestResponse[]>([]);
  const [search, setSearch] = useState(""); const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const [updating, setUpdating] = useState<number | null>(null);
  const [modal, setModal] = useState<"create" | EmergencyRequestResponse | null>(null);

  const load = async () => {
    setLoading(true); setError("");
    try { const response = await managerApi.getEmergencyRequests(); setRequests(response.data ?? []); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể tải yêu cầu khẩn cấp"); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => requests.filter((item) => {
    const haystack = [item.requestType, item.reason, item.employeeId, item.sourceAssignmentId, item.targetAssignmentId].map((value) => text(value).toLowerCase()).join(" ");
    return haystack.includes(search.toLowerCase()) && (status === "ALL" || item.status === status);
  }), [requests, search, status]);

  const updateStatus = async (item: EmergencyRequestResponse, nextStatus: string) => {
    const id = requestId(item); if (!id) return; setUpdating(id); setError("");
    try {
      const response = await managerApi.updateEmergencyRequest(id, { employeeId: item.employeeId, requestType: item.requestType, fromShiftAssignmentId: item.sourceAssignmentId, toAssignmentId: item.targetAssignmentId, reason: item.reason, status: nextStatus });
      setRequests((current) => current.map((entry) => requestId(entry) === id ? response.data : entry));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể cập nhật yêu cầu"); }
    finally { setUpdating(null); }
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const body = { employeeId: Number(values.employeeId), requestType: String(values.requestType), fromShiftAssignmentId: Number(values.sourceAssignmentId), toAssignmentId: Number(values.targetAssignmentId), reason: String(values.reason), status: String(values.status) };
    try {
      if (modal && modal !== "create") {
        const response = await managerApi.updateEmergencyRequest(requestId(modal), body);
        setRequests((current) => current.map((entry) => requestId(entry) === requestId(modal) ? response.data : entry));
      } else {
        const response = await managerApi.createEmergencyRequest(body); setRequests((current) => [...current, response.data]);
      }
      setModal(null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể lưu yêu cầu"); }
  };

  const remove = async (item: EmergencyRequestResponse) => {
    const id = requestId(item); if (!id || !window.confirm("Bạn có chắc muốn xóa yêu cầu này?")) return;
    try { await managerApi.deleteEmergencyRequest(id); setRequests((current) => current.filter((entry) => requestId(entry) !== id)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể xóa yêu cầu"); }
  };

  const formItem = modal && modal !== "create" ? modal : {};
  const form = modal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"><form onSubmit={save} className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-2xl">
    <div className="flex items-center justify-between"><h2 className="text-lg font-black text-slate-800">{modal === "create" ? "Thêm yêu cầu" : "Chỉnh sửa yêu cầu"}</h2><button type="button" onClick={() => setModal(null)} aria-label="Đóng"><X /></button></div>
    <div className="grid gap-3 sm:grid-cols-2">{["employeeId", "sourceAssignmentId", "targetAssignmentId"].map((name) => <label key={name} className="text-xs font-semibold text-slate-600">{name}<input name={name} type="number" required defaultValue={String((formItem as EmergencyRequestResponse)[name === "sourceAssignmentId" ? "sourceAssignmentId" : name === "targetAssignmentId" ? "targetAssignmentId" : "employeeId"] ?? "")} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" /></label>)}<label className="text-xs font-semibold text-slate-600">Loại yêu cầu<input name="requestType" required defaultValue={String((formItem as EmergencyRequestResponse).requestType ?? "")} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" /></label><label className="text-xs font-semibold text-slate-600">Trạng thái<select name="status" defaultValue={String((formItem as EmergencyRequestResponse).status ?? "PENDING")} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"><option>PENDING</option><option>APPROVED</option><option>REJECTED</option></select></label><label className="text-xs font-semibold text-slate-600 sm:col-span-2">Lý do<textarea name="reason" required defaultValue={String((formItem as EmergencyRequestResponse).reason ?? "")} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" rows={3} /></label></div>
    <button className="w-full rounded-xl bg-amber-500 px-4 py-3 text-sm font-black text-slate-900">Lưu yêu cầu</button>
  </form></div>;

  return <div className="mx-auto max-w-7xl space-y-6 p-6">{form}<header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h1 className="text-2xl font-black text-slate-800">Xử lý yêu cầu khẩn cấp</h1><p className="mt-1 text-xs text-slate-500">Dữ liệu trực tiếp từ API.</p></div><button onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold"><RefreshCw className="h-4 w-4" /> Làm mới</button></header>{error && <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700"><AlertCircle className="h-4 w-4" />{error}</div>}<div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 md:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm kiếm..." className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs" /></div><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs"><option value="ALL">Tất cả trạng thái</option><option>PENDING</option><option>APPROVED</option><option>REJECTED</option></select><button onClick={() => setModal("create")} className="inline-flex items-center justify-center gap-1 rounded-xl bg-amber-500 px-4 py-2 text-xs font-black"><Plus className="h-4 w-4" /> Thêm</button></div><div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs"><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 text-[11px] uppercase text-slate-400"><tr><th className="px-5 py-3">Loại</th><th className="px-5 py-3">Nhân viên</th><th className="px-5 py-3">Phân công</th><th className="px-5 py-3">Lý do</th><th className="px-5 py-3">Trạng thái</th><th className="px-5 py-3 text-right">Thao tác</th></tr></thead><tbody className="divide-y divide-slate-100">{!loading && filtered.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">Không có dữ liệu</td></tr>}{filtered.map((item) => { const id = requestId(item); return <tr key={id}><td className="px-5 py-4 font-bold">{label(item.requestType)}</td><td className="px-5 py-4">#{text(item.employeeId)}</td><td className="px-5 py-4">#{text(item.sourceAssignmentId)} → #{text(item.targetAssignmentId)}</td><td className="max-w-sm px-5 py-4">{text(item.reason)}</td><td className="px-5 py-4">{label(item.status)}</td><td className="px-5 py-4"><div className="flex justify-end gap-1"><button onClick={() => setModal(item)} className="rounded-lg p-2 text-blue-600" aria-label="Chỉnh sửa"><Pencil className="h-4 w-4" /></button><button onClick={() => void remove(item)} className="rounded-lg p-2 text-rose-600" aria-label="Xóa"><Trash2 className="h-4 w-4" /></button>{item.status === "PENDING" && <><button disabled={updating === id} onClick={() => void updateStatus(item, "REJECTED")} className="rounded-lg border border-rose-200 px-2 py-1 font-bold text-rose-700"><X className="inline h-3.5 w-3.5" /></button><button disabled={updating === id} onClick={() => void updateStatus(item, "APPROVED")} className="rounded-lg bg-amber-500 px-2 py-1 font-bold"><Check className="inline h-3.5 w-3.5" /></button></>}</div></td></tr>; })}</tbody></table></div></div></div>;
}
