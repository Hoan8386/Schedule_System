"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Check, RefreshCw, Search, X, AlertCircle } from "lucide-react";
import { EmergencyRequestResponse, managerApi } from "@/lib/managerApi";

const text = (value: unknown, fallback = "—") =>
  value === null || value === undefined || value === "" ? fallback : String(value);
const requestId = (item: EmergencyRequestResponse) =>
  item.id ?? item.emergencyRequestId ?? 0;
const label = (value: unknown) =>
  text(value).replaceAll("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

export default function YeuCauPage() {
  const [requests, setRequests] = useState<EmergencyRequestResponse[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await managerApi.getEmergencyRequests();
      setRequests(response.data ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tải yêu cầu khẩn cấp");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(
    () =>
      requests.filter((item) => {
        const haystack = [
          item.requestType,
          item.reason,
          item.employeeId,
          item.sourceAssignmentId,
          item.targetAssignmentId,
        ].map((value) => text(value).toLowerCase()).join(" ");
        return haystack.includes(search.toLowerCase()) &&
          (status === "ALL" || item.status === status);
      }),
    [requests, search, status]
  );

  const updateStatus = async (item: EmergencyRequestResponse, nextStatus: string) => {
    const id = requestId(item);
    if (!id) return;
    setUpdating(id);
    try {
      const response = await managerApi.updateEmergencyRequest(id, {
        employeeId: item.employeeId,
        requestType: item.requestType,
        sourceAssignmentId: item.sourceAssignmentId,
        targetAssignmentId: item.targetAssignmentId,
        reason: item.reason,
        status: nextStatus,
      });
      setRequests((current) => current.map((entry) => requestId(entry) === id ? response.data : entry));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể cập nhật yêu cầu");
    } finally {
      setUpdating(null);
    }
  };

  const pendingCount = requests.filter((item) => item.status === "PENDING").length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-black text-slate-800 tracking-tight">Xử lý yêu cầu khẩn cấp</h1><p className="text-xs text-slate-500 mt-1">Dữ liệu trực tiếp từ API `emergency_request`.</p></div>
        <button onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold disabled:opacity-50"><RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Làm mới</button>
      </header>
      {error && <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700"><AlertCircle className="w-4 h-4" />{error}</div>}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4"><p className="text-xs text-slate-500">Tổng yêu cầu</p><p className="text-2xl font-black text-slate-800">{requests.length}</p></div>
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4"><p className="text-xs text-amber-700">Chờ xử lý</p><p className="text-2xl font-black text-amber-800">{pendingCount}</p></div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 max-w-sm"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm loại yêu cầu, lý do, mã nhân viên..." className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs outline-hidden focus:border-amber-400" /></div>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium"><option value="ALL">Tất cả trạng thái</option><option value="PENDING">Chờ xử lý</option><option value="APPROVED">Đã duyệt</option><option value="REJECTED">Từ chối</option></select>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 text-[11px] uppercase text-slate-400"><tr><th className="px-5 py-3">Loại</th><th className="px-5 py-3">Nhân viên</th><th className="px-5 py-3">Phân công</th><th className="px-5 py-3">Lý do</th><th className="px-5 py-3">Trạng thái</th><th className="px-5 py-3 text-right">Thao tác</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{!loading && filtered.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">Không có yêu cầu từ API</td></tr>}{filtered.map((item) => { const id = requestId(item); return <tr key={id}><td className="px-5 py-4 font-bold text-slate-800">{label(item.requestType)}</td><td className="px-5 py-4 text-slate-600">#{text(item.employeeId)}</td><td className="px-5 py-4 text-slate-600">#{text(item.sourceAssignmentId)} → #{text(item.targetAssignmentId)}</td><td className="px-5 py-4 max-w-sm text-slate-600">{text(item.reason)}</td><td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-700">{label(item.status)}</span></td><td className="px-5 py-4 text-right">{item.status === "PENDING" ? <div className="flex justify-end gap-2"><button disabled={updating === id} onClick={() => void updateStatus(item, "REJECTED")} className="inline-flex items-center gap-1 rounded-xl border border-rose-200 px-3 py-1.5 font-bold text-rose-700 disabled:opacity-50"><X className="w-3.5 h-3.5" /> Từ chối</button><button disabled={updating === id} onClick={() => void updateStatus(item, "APPROVED")} className="inline-flex items-center gap-1 rounded-xl bg-amber-500 px-3 py-1.5 font-bold text-slate-900 disabled:opacity-50"><Check className="w-3.5 h-3.5" /> Duyệt</button></div> : <span className="text-slate-400">Đã xử lý</span>}</td></tr>; })}</tbody>
        </table></div>
      </div>
    </div>
  );
}
