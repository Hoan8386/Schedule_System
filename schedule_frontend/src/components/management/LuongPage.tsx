"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Award, AlertCircle, RefreshCw, Search } from "lucide-react";
import {
  BonusDetailResponse,
  BonusRecordResponse,
  DisciplinaryRecordResponse,
  managerApi,
} from "@/lib/managerApi";

const text = (value: unknown, fallback = "—") =>
  value === null || value === undefined || value === "" ? fallback : String(value);
const money = (value: unknown) =>
  typeof value === "number" ? `${value.toLocaleString("vi-VN")} đ` : text(value);
const label = (value: unknown) =>
  text(value).replaceAll("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

export default function LuongPage() {
  const [records, setRecords] = useState<BonusRecordResponse[]>([]);
  const [details, setDetails] = useState<BonusDetailResponse[]>([]);
  const [disciplinary, setDisciplinary] = useState<DisciplinaryRecordResponse[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [recordResponse, detailResponse, disciplinaryResponse] = await Promise.all([
        managerApi.getBonusRecords(),
        managerApi.getBonusDetails(),
        managerApi.getDisciplinaryRecords(),
      ]);
      setRecords(recordResponse.data ?? []);
      setDetails(detailResponse.data ?? []);
      setDisciplinary(disciplinaryResponse.data ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tải dữ liệu lương thưởng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => records.filter((record) => {
    const haystack = `${record.employeeId ?? ""} ${record.payrollMonth ?? ""} ${record.status ?? ""}`.toLowerCase();
    return haystack.includes(search.toLowerCase()) &&
      (status === "ALL" || record.status === status);
  }), [records, search, status]);
  const totalBonus = records.reduce((sum, item) => sum + (item.totalBonus ?? 0), 0);
  const totalPenalty = records.reduce((sum, item) => sum + (item.totalPenalty ?? 0), 0);
  const pending = records.filter((item) => item.status === "PENDING").length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-black text-slate-800 tracking-tight">Quản lý lương & thưởng</h1><p className="text-xs text-slate-500 mt-1">Dữ liệu tổng hợp trực tiếp từ `bonus_record`, `bonus_detail` và `disciplinary_record`.</p></div>
        <button onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold disabled:opacity-50"><RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Làm mới</button>
      </header>
      {error && <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700"><AlertCircle className="w-4 h-4" />{error}</div>}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5"><p className="text-xs text-slate-500">Bản ghi thưởng</p><p className="text-2xl font-black text-slate-800">{records.length}</p></div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5"><p className="text-xs text-slate-500">Tổng thưởng</p><p className="text-2xl font-black text-emerald-700">{money(totalBonus)}</p></div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5"><p className="text-xs text-slate-500">Tổng phạt</p><p className="text-2xl font-black text-rose-700">{money(totalPenalty)}</p></div>
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5"><p className="text-xs text-amber-700">Chờ duyệt</p><p className="text-2xl font-black text-amber-800">{pending}</p></div>
      </div>
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row gap-3"><div className="relative flex-1 max-w-sm"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm mã nhân viên hoặc tháng lương..." className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs outline-hidden focus:border-amber-400" /></div><select value={status} onChange={(event) => setStatus(event.target.value)} className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium"><option value="ALL">Tất cả trạng thái</option><option value="PENDING">Chờ duyệt</option><option value="APPROVED">Đã duyệt</option></select></div>
        <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 text-[11px] uppercase text-slate-400"><tr><th className="px-4 py-3">Nhân viên</th><th className="px-4 py-3">Tháng lương</th><th className="px-4 py-3 text-right">Thưởng</th><th className="px-4 py-3 text-right">Phạt</th><th className="px-4 py-3 text-right">Tổng tiền</th><th className="px-4 py-3">Trạng thái</th></tr></thead><tbody className="divide-y divide-slate-100">{!loading && filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">Không có bản ghi lương thưởng từ API</td></tr>}{filtered.map((record, index) => <tr key={String(record.bonusRecordId ?? index)}><td className="px-4 py-4 font-bold text-slate-800">#{text(record.employeeId)}</td><td className="px-4 py-4 text-slate-600">{text(record.payrollMonth)}</td><td className="px-4 py-4 text-right font-bold text-emerald-600">{money(record.totalBonus)}</td><td className="px-4 py-4 text-right font-bold text-rose-600">{money(record.totalPenalty)}</td><td className="px-4 py-4 text-right font-black text-slate-900">{money(record.totalAmount)}</td><td className="px-4 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-700">{label(record.status)}</span></td></tr>)}</tbody></table></div>
      </section>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5"><div className="flex items-center gap-2 mb-4"><Award className="w-4 h-4 text-amber-600" /><h2 className="font-bold text-slate-800 text-sm">Chi tiết thưởng/phạt</h2></div><div className="space-y-2">{!loading && details.length === 0 && <p className="text-xs text-slate-400">Chưa có chi tiết từ API</p>}{details.map((detail) => <div key={String(detail.bonusDetailId)} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"><div><p className="text-xs font-bold text-slate-800">{label(detail.type)}</p><p className="text-[11px] text-slate-500">{text(detail.reason)} · Bản ghi #{text(detail.bonusRecordId)}</p></div><span className="font-black text-emerald-600">{money(detail.amount)}</span></div>)}</div></section>
        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5"><div className="flex items-center gap-2 mb-4"><AlertCircle className="w-4 h-4 text-rose-600" /><h2 className="font-bold text-slate-800 text-sm">Hồ sơ kỷ luật</h2></div><div className="space-y-2">{!loading && disciplinary.length === 0 && <p className="text-xs text-slate-400">Chưa có hồ sơ kỷ luật từ API</p>}{disciplinary.map((item) => <div key={String(item.disciplinaryId)} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"><div><p className="text-xs font-bold text-slate-800">Nhân viên #{text(item.employeeId)} · {label(item.disciplinaryType)}</p><p className="text-[11px] text-slate-500">{text(item.reason)}</p></div><span className="font-black text-rose-600">{money(item.amount)}</span></div>)}</div></section>
      </div>
    </div>
  );
}
