"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Pencil, Plus, RefreshCw, Search, ShieldAlert, Trash2, X } from "lucide-react";
import { managerApi, RuleResponse, ViolationResponse } from "@/lib/managerApi";

const text = (value: unknown, fallback = "—") => value === null || value === undefined || value === "" ? fallback : String(value);
const money = (value: unknown) => typeof value === "number" ? `${value.toLocaleString("vi-VN")} đ` : text(value);
const label = (value: unknown) => text(value).replaceAll("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
const inputClass = "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100";
const formValues = (form: HTMLFormElement, numericFields: string[]) => {
  const values: Record<string, unknown> = Object.fromEntries(new FormData(form).entries());
  numericFields.forEach((name) => { if (values[name] !== "") values[name] = Number(values[name]); });
  return values;
};

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="module5-modal-title">
      <div className="flex items-center justify-between border-b border-slate-100 p-5"><h2 id="module5-modal-title" className="text-lg font-black text-slate-800">{title}</h2><button type="button" aria-label="Đóng cửa sổ" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>
      {children}
    </div>
  </div>;
}

export default function NoiQuyPage() {
  const [rules, setRules] = useState<RuleResponse[]>([]);
  const [violations, setViolations] = useState<ViolationResponse[]>([]);
  const [search, setSearch] = useState(""); const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const [modal, setModal] = useState<"rule" | "violation" | null>(null);
  const [editing, setEditing] = useState<RuleResponse | ViolationResponse | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => { setLoading(true); setError(""); try {
    const [ruleResponse, violationResponse] = await Promise.all([managerApi.getRules(), managerApi.getViolations()]);
    setRules(ruleResponse.data ?? []); setViolations(violationResponse.data ?? []);
  } catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể tải dữ liệu Module 5"); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);
  const filteredViolations = useMemo(() => violations.filter((item) => {
    const haystack = `${item.ruleName ?? ""} ${item.category ?? ""} ${item.description ?? ""} ${item.attendanceId ?? ""}`.toLowerCase();
    return haystack.includes(search.toLowerCase()) && (status === "ALL" || item.status === status);
  }), [violations, search, status]);

  const remove = async (kind: "rule" | "violation", id?: number) => {
    if (id === undefined || !window.confirm("Bạn có chắc muốn xóa bản ghi này?")) return;
    try { if (kind === "rule") await managerApi.deleteRule(Number(id)); else await managerApi.deleteViolation(Number(id)); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể xóa bản ghi"); }
  };
  const open = (kind: "rule" | "violation", item?: RuleResponse | ViolationResponse) => { setModal(kind); setEditing(item ?? null); };
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setError("");
    const values = formValues(event.currentTarget, modal === "rule" ? ["penaltyAmount"] : ["ruleId", "disciplinaryCodeId", "attendanceId", "penaltyAmount"]);
    try {
      if (modal === "rule") editing?.ruleId ? await managerApi.updateRule(Number(editing.ruleId), values) : await managerApi.createRule(values);
      if (modal === "violation") editing?.violationId ? await managerApi.updateViolation(Number(editing.violationId), values) : await managerApi.createViolation(values);
      setModal(null); setEditing(null); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể lưu bản ghi"); } finally { setSaving(false); }
  };
  const field = (name: string, labelText: string, value: unknown, type = "text", required = false) => <label className="space-y-1.5 text-sm font-semibold text-slate-700">{labelText}{required && <span className="text-rose-500"> *</span>}<input name={name} type={type} defaultValue={text(value, "")} required={required} className={inputClass} /></label>;

  return <div className="mx-auto max-w-7xl space-y-6 p-6">
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h1 className="text-2xl font-black tracking-tight text-slate-800">Nội quy & xử lý vi phạm</h1><p className="mt-1 text-xs text-slate-500">Dữ liệu trực tiếp từ rule và violation API.</p></div><div className="flex gap-2"><button onClick={() => open("rule")} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-600"><Plus className="h-4 w-4" />Thêm quy định</button><button onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Làm mới</button></div></header>
    {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">{error}</div>}
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{[["Tổng quy định", rules.length, "text-slate-800"], ["Tổng vi phạm", violations.length, "text-slate-800"], ["Đang xử lý", violations.filter((item) => item.status === "PENDING").length, "text-amber-700"], ["Tổng tiền phạt", money(violations.reduce((sum, item) => sum + (typeof item.penaltyAmount === "number" ? item.penaltyAmount : 0), 0)), "text-rose-700"]].map(([title, value, color]) => <div key={String(title)} className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-xs text-slate-500">{title}</p><p className={`text-2xl font-black ${color}`}>{value}</p></div>)}</div>
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs lg:col-span-2"><div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/50 p-4 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input aria-label="Tìm vi phạm" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm quy định hoặc mô tả vi phạm..." className={`${inputClass} pl-9`} /></div><select aria-label="Lọc trạng thái" value={status} onChange={(event) => setStatus(event.target.value)} className={inputClass}><option value="ALL">Tất cả trạng thái</option><option value="PENDING">Đang xử lý</option><option value="CONFIRMED">Đã xác nhận</option><option value="COMPLETED">Hoàn tất</option></select><button onClick={() => open("violation")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white"><Plus className="h-4 w-4" />Thêm vi phạm</button></div>
        <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 text-[11px] uppercase text-slate-400"><tr><th className="px-4 py-3">Quy định</th><th className="px-4 py-3">Chấm công</th><th className="px-4 py-3">Thời gian</th><th className="px-4 py-3">Mức phạt</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Thao tác</th></tr></thead><tbody className="divide-y divide-slate-100">{!loading && filteredViolations.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">Không có dữ liệu vi phạm từ API</td></tr>}{filteredViolations.map((item, index) => <tr key={String(item.violationId ?? index)}><td className="px-4 py-4"><p className="font-bold text-slate-800">{text(item.ruleName, `Rule #${text(item.ruleId)}`)}</p><p className="text-[11px] text-slate-500">{text(item.description)}</p></td><td className="px-4 py-4 text-slate-600">#{text(item.attendanceId)}</td><td className="px-4 py-4 text-slate-600">{item.violationTime ? new Date(item.violationTime).toLocaleString("vi-VN") : "—"}</td><td className="px-4 py-4 font-bold text-rose-600">{money(item.penaltyAmount)}</td><td className="px-4 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-700">{label(item.status)}</span></td><td className="px-4 py-4"><div className="flex gap-1"><button aria-label="Sửa vi phạm" onClick={() => open("violation", item)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Pencil className="h-4 w-4" /></button><button aria-label="Xóa vi phạm" onClick={() => void remove("violation", item.violationId)} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}</tbody></table></div>
      </section>
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs"><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-amber-600" /><h2 className="text-sm font-bold text-slate-800">Nội quy hiện hành</h2></div><button aria-label="Thêm quy định" onClick={() => open("rule")} className="rounded-lg p-2 text-amber-600 hover:bg-amber-50"><Plus className="h-4 w-4" /></button></div><div className="space-y-3">{!loading && rules.length === 0 && <p className="text-xs text-slate-400">Chưa có quy định từ API</p>}{rules.map((rule) => <div key={String(rule.ruleId)} className="rounded-xl border border-slate-100 border-l-4 border-l-amber-500 bg-slate-50/60 p-3"><div className="flex justify-between gap-2"><p className="text-xs font-bold text-slate-800">{text(rule.ruleName, text(rule.ruleCode))}</p><div className="flex"><button aria-label="Sửa quy định" onClick={() => open("rule", rule)} className="rounded p-1 text-slate-500 hover:bg-white"><Pencil className="h-3.5 w-3.5" /></button><button aria-label="Xóa quy định" onClick={() => void remove("rule", rule.ruleId)} className="rounded p-1 text-rose-500 hover:bg-white"><Trash2 className="h-3.5 w-3.5" /></button></div></div><p className="mt-1 text-[11px] text-slate-500">{text(rule.description)}</p><p className="mt-1 text-[11px] font-bold text-rose-600">{label(rule.penaltyType)} · {money(rule.penaltyAmount)}</p></div>)}</div></section>
    </div>
    {modal && <Modal title={`${editing ? "Sửa" : "Thêm"} ${modal === "rule" ? "quy định" : "vi phạm"}`} onClose={() => !saving && setModal(null)}><form onSubmit={save} className="space-y-4 p-5">{modal === "rule" ? <>{field("ruleCode", "Mã quy định", (editing as RuleResponse | null)?.ruleCode, "text", true)}{field("ruleName", "Tên quy định", (editing as RuleResponse | null)?.ruleName, "text", true)}{field("category", "Danh mục", (editing as RuleResponse | null)?.category)}{field("description", "Mô tả", (editing as RuleResponse | null)?.description)}<div className="grid grid-cols-2 gap-3">{field("penaltyType", "Loại phạt", (editing as RuleResponse | null)?.penaltyType)}{field("penaltyAmount", "Mức phạt", (editing as RuleResponse | null)?.penaltyAmount, "number")}</div>{field("status", "Trạng thái", (editing as RuleResponse | null)?.status ?? "ACTIVE")}</> : <><div className="grid grid-cols-2 gap-3">{field("ruleId", "Mã quy định", (editing as ViolationResponse | null)?.ruleId, "number", true)}{field("attendanceId", "Mã chấm công", (editing as ViolationResponse | null)?.attendanceId, "number")}</div>{field("violationTime", "Thời gian", (editing as ViolationResponse | null)?.violationTime, "datetime-local", true)}{field("description", "Mô tả", (editing as ViolationResponse | null)?.description, "text", true)}{field("penaltyAmount", "Mức phạt", (editing as ViolationResponse | null)?.penaltyAmount, "number")}<div className="grid grid-cols-2 gap-3">{field("penaltyType", "Loại phạt", (editing as ViolationResponse | null)?.penaltyType)}{field("status", "Trạng thái", (editing as ViolationResponse | null)?.status ?? "PENDING")}</div></>}<div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setModal(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600">Hủy</button><button disabled={saving} className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">{saving ? "Đang lưu..." : "Lưu thay đổi"}</button></div></form></Modal>}
  </div>;
}
