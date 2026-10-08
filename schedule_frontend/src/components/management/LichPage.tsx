"use client";

import React, { useEffect, useState } from "react";
import { Calendar, Clock, RefreshCw, AlertCircle } from "lucide-react";
import {
  managerApi,
  SchedulePeriodResponse,
  ShiftResponse,
  ShiftByDateResponse,
  ShiftAssignmentResponse,
} from "@/lib/managerApi";

const text = (value: unknown, fallback = "—") =>
  value === null || value === undefined || value === "" ? fallback : String(value);
const idOf = (item: Record<string, unknown>) =>
  item.id ?? item.schedulePeriodId ?? item.shiftId ?? item.shiftByDateId ?? "—";
const date = (value: unknown) =>
  value ? new Date(String(value)).toLocaleDateString("vi-VN") : "—";
const timeRange = (start: unknown, end: unknown) =>
  `${text(start, "--:--")} – ${text(end, "--:--")}`;

export default function LichPage() {
  const [periods, setPeriods] = useState<SchedulePeriodResponse[]>([]);
  const [shifts, setShifts] = useState<ShiftResponse[]>([]);
  const [shiftDates, setShiftDates] = useState<ShiftByDateResponse[]>([]);
  const [assignments, setAssignments] = useState<ShiftAssignmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [periodResponse, shiftResponse, dateResponse, assignmentResponse] =
        await Promise.all([
          managerApi.getSchedulePeriods(),
          managerApi.getShifts(),
          managerApi.getShiftsByDate(),
          managerApi.getShiftAssignments(),
        ]);
      setPeriods(periodResponse.data ?? []);
      setShifts(shiftResponse.data ?? []);
      setShiftDates(dateResponse.data ?? []);
      setAssignments(assignmentResponse.data ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tải dữ liệu lịch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Quản lý lịch & ca làm việc
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dữ liệu được tải trực tiếp từ các API Module 3.
          </p>
        </div>
        <button
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </header>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-600" />
          <div>
            <h2 className="font-bold text-slate-800 text-sm">Kỳ lập lịch</h2>
            <p className="text-[11px] text-slate-400">{periods.length} kỳ từ API</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] text-slate-400 uppercase">
              <tr>
                <th className="px-5 py-3">Tên kỳ</th>
                <th className="px-5 py-3">Thời gian</th>
                <th className="px-5 py-3">Mở đăng ký</th>
                <th className="px-5 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!loading && periods.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-400">Chưa có kỳ lập lịch</td></tr>
              )}
              {periods.map((period) => (
                <tr key={String(idOf(period as Record<string, unknown>))}>
                  <td className="px-5 py-4 font-bold text-slate-800">{text(period.periodName)}</td>
                  <td className="px-5 py-4 text-slate-600">{date(period.startDate)} – {date(period.endDate)}</td>
                  <td className="px-5 py-4 text-slate-600">{date(period.registrationOpenAt)}</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-700">{text(period.status)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <div><h2 className="font-bold text-slate-800 text-sm">Ca mẫu</h2><p className="text-[11px] text-slate-400">{shifts.length} ca từ API</p></div>
          </div>
          <div className="divide-y divide-slate-100">
            {!loading && shifts.length === 0 && <p className="p-6 text-center text-xs text-slate-400">Chưa có ca mẫu</p>}
            {shifts.map((shift) => (
              <div key={String(idOf(shift as Record<string, unknown>))} className="px-5 py-4 flex items-center justify-between gap-3">
                <div><p className="font-bold text-sm text-slate-800">{text(shift.shiftName, text(shift.shiftCode))}</p><p className="text-xs text-slate-500">{timeRange(shift.startTime, shift.endTime)}</p></div>
                <div className="text-right"><p className="font-black text-emerald-600">{shift.payRate == null ? "—" : `${shift.payRate.toLocaleString("vi-VN")} đ`}</p><p className="text-[11px] text-slate-400">Tối đa {text(shift.maxCapacity)}</p></div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 text-sm">Ca theo ngày</h2>
            <p className="text-[11px] text-slate-400">{shiftDates.length} ca ngày, {assignments.length} phân công</p>
          </div>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {!loading && shiftDates.length === 0 && <p className="p-6 text-center text-xs text-slate-400">Chưa có ca theo ngày</p>}
            {shiftDates.map((item) => (
              <div key={String(idOf(item as Record<string, unknown>))} className="px-5 py-4 flex items-center justify-between gap-3">
                <div><p className="font-bold text-sm text-slate-800">{text(item.shiftName, `Ca #${text(item.shiftId)}`)}</p><p className="text-xs text-slate-500">{date(item.workDate)} · {timeRange(item.startTime, item.endTime)}</p></div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">{text(item.status)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
