"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, RefreshCw, Search, ShieldAlert } from "lucide-react";
import { managerApi, RuleResponse, ViolationResponse } from "@/lib/managerApi";

const text = (value: unknown, fallback = "—") =>
  value === null || value === undefined || value === "" ? fallback : String(value);
const money = (value: unknown) =>
  typeof value === "number" ? `${value.toLocaleString("vi-VN")} đ` : text(value);
const label = (value: unknown) =>
  text(value).replaceAll("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

export default function NoiQuyPage() {
  const [rules, setRules] = useState<RuleResponse[]>([]);
  const [violations, setViolations] = useState<ViolationResponse[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [ruleResponse, violationResponse] = await Promise.all([
        managerApi.getRules(),
        managerApi.getViolations(),
      ]);
      setRules(ruleResponse.data ?? []);
      setViolations(violationResponse.data ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tải dữ liệu Module 5");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const filteredViolations = useMemo(() => violations.filter((item) => {
    const haystack = `${item.ruleName ?? ""} ${item.category ?? ""} ${item.description ?? ""} ${item.attendanceId ?? ""}`.toLowerCase();
    return haystack.includes(search.toLowerCase()) &&
      (status === "ALL" || item.status === status);
  }), [violations, search, status]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Nội quy & xử lý vi phạm</h1>
          <p className="text-xs text-slate-500 mt-1">Dữ liệu trực tiếp từ `rule` và `violation` API.</p>
        </div>
        <button onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Làm mới
        </button>
      </header>
      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">{error}</div>}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5"><p className="text-xs text-slate-500">Tổng quy định</p><p className="text-2xl font-black text-slate-800">{rules.length}</p></div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5"><p className="text-xs text-slate-500">Tổng vi phạm</p><p className="text-2xl font-black text-slate-800">{violations.length}</p></div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5"><p className="text-xs text-slate-500">Đang xử lý</p><p className="text-2xl font-black text-amber-700">{violations.filter((item) => item.status === "PENDING").length}</p></div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5"><p className="text-xs text-slate-500">Tổng tiền phạt</p><p className="text-2xl font-black text-rose-700">{money(violations.reduce((sum, item) => sum + (typeof item.penaltyAmount === "number" ? item.penaltyAmount : 0), 0))}</p></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm quy định hoặc mô tả vi phạm..." className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs outline-hidden focus:border-amber-400" /></div>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium"><option value="ALL">Tất cả trạng thái</option><option value="PENDING">Đang xử lý</option><option value="CONFIRMED">Đã xác nhận</option><option value="COMPLETED">Hoàn tất</option></select>
          </div>
          <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 text-[11px] uppercase text-slate-400"><tr><th className="px-4 py-3">Quy định</th><th className="px-4 py-3">Chấm công</th><th className="px-4 py-3">Thời gian</th><th className="px-4 py-3">Mức phạt</th><th className="px-4 py-3">Trạng thái</th></tr></thead><tbody className="divide-y divide-slate-100">{!loading && filteredViolations.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">Không có dữ liệu vi phạm từ API</td></tr>}{filteredViolations.map((item, index) => <tr key={String(item.violationId ?? index)}><td className="px-4 py-4"><p className="font-bold text-slate-800">{text(item.ruleName, `Rule #${text(item.ruleId)}`)}</p><p className="text-[11px] text-slate-500">{text(item.description)}</p></td><td className="px-4 py-4 text-slate-600">#{text(item.attendanceId)}</td><td className="px-4 py-4 text-slate-600">{item.violationTime ? new Date(item.violationTime).toLocaleString("vi-VN") : "—"}</td><td className="px-4 py-4 font-bold text-rose-600">{money(item.penaltyAmount)}</td><td className="px-4 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-700">{label(item.status)}</span></td></tr>)}</tbody></table></div>
        </section>
        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center gap-2 mb-4"><ShieldAlert className="w-4 h-4 text-amber-600" /><h2 className="font-bold text-slate-800 text-sm">Nội quy hiện hành</h2></div>
          <div className="space-y-3">{!loading && rules.length === 0 && <p className="text-xs text-slate-400">Chưa có quy định từ API</p>}{rules.map((rule) => <div key={String(rule.ruleId)} className="rounded-xl border border-slate-100 border-l-4 border-l-amber-500 bg-slate-50/60 p-3"><p className="text-xs font-bold text-slate-800">{text(rule.ruleName, text(rule.ruleCode))}</p><p className="text-[11px] text-slate-500 mt-1">{text(rule.description)}</p><p className="text-[11px] font-bold text-rose-600 mt-1">{label(rule.penaltyType)} · {money(rule.penaltyAmount)}</p></div>)}</div>
        </section>
      </div>
    </div>
  );
}
