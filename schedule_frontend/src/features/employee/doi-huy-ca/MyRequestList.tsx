"use client";

import React, { useMemo, useState } from "react";
import { Alert, EmptyState, Spinner } from "@/components/ui";
import { employeeApi } from "@/lib/api";
import { dayKey, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import { useKeyedLoad } from "@/features/statistics/useStatistics";
import { shiftLabel, statusMeta, useGroupShifts, useMyShifts } from "./model";

/** Cùng loại yêu cầu như danh sách yêu cầu của quản lý. */
const REQUEST_TYPES = {
  REGISTER: { label: "Đăng ký ca", badge: "bg-blue-100 text-blue-700" },
  ADD: { label: "Thêm ca", badge: "bg-emerald-100 text-emerald-700" },
  CANCEL: { label: "Hủy ca", badge: "bg-rose-100 text-rose-700" },
  CHANGE: { label: "Đổi ca", badge: "bg-violet-100 text-violet-700" },
} as const;
type RequestType = keyof typeof REQUEST_TYPES;

interface Row {
  key: string;
  type: RequestType;
  shift: string;
  target: string;
  workDate: string;
  status: string;
  sentAt: string;
  reason: string;
  note: string;
}

const EMPTY_FILTERS = {
  type: "",
  status: "",
  workFrom: "",
  workTo: "",
  sentFrom: "",
  sentTo: "",
  q: "",
};

/**
 * Danh sách yêu cầu của nhân viên (đăng ký ca + thêm / đổi / hủy ca), lọc theo từng cột
 * giống danh sách yêu cầu bên trang quản lý (chỉ xem, không duyệt).
 */
export default function MyRequestList() {
  const { shifts: myShifts, loading: loadingMine } = useMyShifts();
  const { shifts: groupShifts, loading: loadingGroup } = useGroupShifts();
  const assignments = useKeyedLoad(
    "my-assignments",
    () => employeeApi.getAssignments(),
    "Không thể tải đăng ký ca",
  );
  const requests = useKeyedLoad(
    "my-requests",
    () => employeeApi.getEmergencyRequests(),
    "Không thể tải yêu cầu",
  );
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const setFilter = (key: keyof typeof EMPTY_FILTERS, value: string) =>
    setFilters((current) => ({ ...current, [key]: value }));

  const rows = useMemo<Row[]>(() => {
    const byAssignment = new Map(
      myShifts.map((shift) => [shift.assignmentId, shift]),
    );
    const byShiftDate = new Map(
      groupShifts.map((shift) => [shift.shiftByDateId, shift]),
    );

    const registrations = (assignments.data ?? []).map((item): Row => {
      const id = Number(item.id ?? item.shiftAssignmentId);
      const shift = byAssignment.get(id);
      return {
        key: `a-${id}`,
        type: "REGISTER",
        shift: shift ? shiftLabel(shift) : `Phân ca #${id}`,
        target: "",
        workDate: shift?.workDate ?? "",
        status: String(item.status ?? "").toUpperCase(),
        sentAt: String(item.registeredAt ?? ""),
        reason: String(item.note ?? ""),
        note: String(item.cancellationReason ?? ""),
      };
    });

    const emergencies = (requests.data ?? []).map((item): Row => {
      const id = Number(item.emergencyRequestId ?? item.id);
      const type = String(item.requestType ?? "").toUpperCase();
      const source = byAssignment.get(Number(item.assignmentId));
      const target = byShiftDate.get(Number(item.toAssignmentId));
      return {
        key: `e-${id}`,
        type: type in REQUEST_TYPES ? (type as RequestType) : "ADD",
        shift: source
          ? shiftLabel(source)
          : type === "ADD" && target
            ? shiftLabel(target)
            : "—",
        target: type === "CHANGE" && target ? shiftLabel(target) : "",
        workDate: source?.workDate ?? target?.workDate ?? "",
        status: String(item.status ?? "").toUpperCase(),
        sentAt: String(item.requestedAt ?? item.createdAt ?? ""),
        reason: String(item.reason ?? ""),
        note: String(item.processNote ?? ""),
      };
    });

    return [...registrations, ...emergencies].sort((a, b) =>
      b.sentAt.localeCompare(a.sentAt),
    );
  }, [myShifts, groupShifts, assignments.data, requests.data]);

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return rows.filter((row) => {
      if (filters.type && row.type !== filters.type) return false;
      if (filters.status && row.status !== filters.status) return false;
      if (
        filters.workFrom &&
        (!row.workDate || row.workDate < filters.workFrom)
      )
        return false;
      if (filters.workTo && (!row.workDate || row.workDate > filters.workTo))
        return false;
      const sent = dayKey(row.sentAt);
      if (filters.sentFrom && (!sent || sent < filters.sentFrom)) return false;
      if (filters.sentTo && (!sent || sent > filters.sentTo)) return false;
      if (
        q &&
        !`${row.shift} ${row.target} ${row.reason}`.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [rows, filters]);

  const statuses = useMemo(
    () => [...new Set(rows.map((row) => row.status).filter(Boolean))].sort(),
    [rows],
  );
  const loading =
    loadingMine || loadingGroup || assignments.loading || requests.loading;
  const controlClass =
    "rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium outline-hidden";
  const hasFilter = Object.values(filters).some(Boolean);

  return (
    <div className="mt-4 space-y-3">
      {(assignments.error || requests.error) && (
        <Alert>{assignments.error || requests.error}</Alert>
      )}

      <div className="flex flex-wrap items-end gap-2 text-xs">
        <label className="flex flex-col gap-1 text-[10px] font-semibold text-slate-500">
          Tìm kiếm
          <input
            value={filters.q}
            onChange={(event) => setFilter("q", event.target.value)}
            placeholder="Ca, lý do..."
            className={controlClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-[10px] font-semibold text-slate-500">
          Loại yêu cầu
          <select
            value={filters.type}
            onChange={(event) => setFilter("type", event.target.value)}
            className={controlClass}
          >
            <option value="">Tất cả</option>
            {(Object.keys(REQUEST_TYPES) as RequestType[]).map((key) => (
              <option key={key} value={key}>
                {REQUEST_TYPES[key].label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[10px] font-semibold text-slate-500">
          Trạng thái
          <select
            value={filters.status}
            onChange={(event) => setFilter("status", event.target.value)}
            className={controlClass}
          >
            <option value="">Tất cả</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {statusMeta(status).label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[10px] font-semibold text-slate-500">
          Ngày làm từ
          <input
            type="date"
            value={filters.workFrom}
            onChange={(event) => setFilter("workFrom", event.target.value)}
            className={controlClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-[10px] font-semibold text-slate-500">
          đến
          <input
            type="date"
            value={filters.workTo}
            onChange={(event) => setFilter("workTo", event.target.value)}
            className={controlClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-[10px] font-semibold text-slate-500">
          Gửi từ
          <input
            type="date"
            value={filters.sentFrom}
            onChange={(event) => setFilter("sentFrom", event.target.value)}
            className={controlClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-[10px] font-semibold text-slate-500">
          đến
          <input
            type="date"
            value={filters.sentTo}
            onChange={(event) => setFilter("sentTo", event.target.value)}
            className={controlClass}
          />
        </label>
        {hasFilter && (
          <button
            type="button"
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="px-2 py-1.5 font-bold text-brand-700 hover:underline"
          >
            Xóa bộ lọc
          </button>
        )}
        <span className="ml-auto pb-1.5 text-[11px] font-semibold text-slate-500">
          {filtered.length} yêu cầu
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500">
              <th className="px-3 py-2.5">Loại</th>
              <th className="px-3 py-2.5">Ca</th>
              <th className="px-3 py-2.5">Đổi sang</th>
              <th className="px-3 py-2.5">Lý do / ghi chú</th>
              <th className="px-3 py-2.5">Gửi lúc</th>
              <th className="px-3 py-2.5">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filtered.map((row) => {
              const status = statusMeta(row.status);
              return (
                <tr key={row.key}>
                  <td className="px-3 py-2.5">
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[10px] font-bold",
                        REQUEST_TYPES[row.type].badge,
                      )}
                    >
                      {REQUEST_TYPES[row.type].label}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-semibold text-slate-800">
                    {row.shift}
                  </td>
                  <td className="px-3 py-2.5 text-slate-600">
                    {row.target || "—"}
                  </td>
                  <td className="max-w-xs px-3 py-2.5 text-slate-600">
                    {row.reason || "—"}
                    {row.note && (
                      <span className="mt-0.5 block text-[10px] text-slate-400">
                        {row.note}
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-slate-500">
                    {formatDateTime(row.sentAt)}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={cn(
                        "rounded-md border px-2 py-0.5 text-[10px] font-bold",
                        status.className,
                      )}
                    >
                      {status.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {loading && <Spinner className="p-6" label="Đang tải yêu cầu..." />}
        {!loading && filtered.length === 0 && (
          <EmptyState className="m-4">
            Không có yêu cầu nào{rows.length ? " khớp bộ lọc" : ""}.
          </EmptyState>
        )}
      </div>
    </div>
  );
}
