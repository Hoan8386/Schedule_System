"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeftRight, CalendarX, Plus, RefreshCw } from "lucide-react";
import { Alert, Button, Card, EmptyState, PageHeader, Spinner } from "@/components/ui";
import { employeeApi, type EmergencyRequestResponse, type ShiftByDateResponse } from "@/lib/api";
import { formatDateTime, localKey } from "@/lib/format";
import { cn } from "@/lib/cn";
import ShiftRequestModal from "./ShiftRequestModal";
import { REQUEST_META, addDays, shiftLabel, statusMeta, useMyShifts, type ShiftRequestType } from "./model";

/** Trang "Đổi ca" / "Hủy ca": danh sách yêu cầu đã gửi + nút tạo yêu cầu mới (không tự mở modal). */
export default function ShiftRequestsPage({ type }: { type: ShiftRequestType }) {
  const meta = REQUEST_META[type];
  const [version, setVersion] = useState(0);
  const [requests, setRequests] = useState<EmergencyRequestResponse[]>([]);
  const [targets, setTargets] = useState<Map<number, ShiftByDateResponse>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const { shifts } = useMyShifts(version);

  useEffect(() => {
    let active = true;
    const today = new Date();
    Promise.all([
      employeeApi.getEmergencyRequests(),
      type === "CHANGE"
        ? employeeApi.getShiftsByDate({ from: localKey(addDays(today, -60)), to: localKey(addDays(today, 60)) })
        : Promise.resolve({ data: [] as ShiftByDateResponse[] }),
    ])
      .then(([requestResult, shiftResult]) => {
        if (!active) return;
        setRequests(
          (requestResult.data ?? [])
            .filter((item) => String(item.requestType ?? "").toUpperCase() === type)
            .sort((a, b) => String(b.requestedAt ?? "").localeCompare(String(a.requestedAt ?? "")))
        );
        setTargets(new Map((shiftResult.data ?? []).map((shift) => [Number(shift.shiftByDateId ?? shift.id), shift])));
        setError("");
      })
      .catch((requestError: Error) => active && setError(requestError.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [type, version]);

  const reload = () => {
    setLoading(true);
    setVersion((value) => value + 1);
  };

  const byAssignment = useMemo(() => new Map(shifts.map((shift) => [shift.assignmentId, shift])), [shifts]);
  const pending = requests.filter((item) => String(item.status ?? "").toUpperCase() === "PENDING").length;
  const Icon = type === "CHANGE" ? ArrowLeftRight : CalendarX;

  return (
    <div className="page">
      <PageHeader
        title={meta.title}
        subtitle={meta.description}
        actions={
          <>
            <Button variant="secondary" icon={RefreshCw} onClick={reload} disabled={loading}>
              Tải lại
            </Button>
            <Button icon={Plus} onClick={() => setCreating(true)}>
              {meta.action}
            </Button>
          </>
        }
      />

      {error && <Alert>{error}</Alert>}

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
            <Icon className="h-4 w-4 text-brand-600" />
            Yêu cầu {meta.title.toLowerCase()} của tôi ({requests.length})
          </h3>
          {pending > 0 && <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-700">{pending} chờ duyệt</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-400">
                <th className="px-4 py-3">Ca hiện tại</th>
                {type === "CHANGE" && <th className="px-4 py-3">Đổi sang</th>}
                <th className="px-4 py-3">Lý do</th>
                <th className="px-4 py-3">Gửi lúc</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Ghi chú xử lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {requests.map((item) => {
                const id = Number(item.emergencyRequestId ?? item.id);
                const source = byAssignment.get(Number(item.assignmentId ?? item.fromShiftAssignmentId));
                const target = targets.get(Number(item.toAssignmentId));
                const status = statusMeta(item.status);
                return (
                  <tr key={id}>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">{source ? shiftLabel(source) : `Phân ca #${String(item.assignmentId ?? "—")}`}</td>
                    {type === "CHANGE" && (
                      <td className="px-4 py-3.5 text-slate-600">{target ? shiftLabel(target) : item.toAssignmentId ? `Ca #${String(item.toAssignmentId)}` : "—"}</td>
                    )}
                    <td className="max-w-sm px-4 py-3.5 text-slate-600">{String(item.reason ?? "")}</td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-500">{formatDateTime(item.requestedAt)}</td>
                    <td className="px-4 py-3.5">
                      <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-bold", status.className)}>{status.label}</span>
                    </td>
                    <td className="max-w-xs px-4 py-3.5 text-slate-500">{String(item.processNote ?? "") || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {loading && <Spinner className="p-6" label="Đang tải yêu cầu..." />}
          {!loading && requests.length === 0 && (
            <EmptyState className="m-4">Bạn chưa gửi yêu cầu {meta.title.toLowerCase()} nào. Bấm “{meta.action}” để bắt đầu.</EmptyState>
          )}
        </div>
      </Card>

      <ShiftRequestModal type={type} open={creating} onClose={() => setCreating(false)} onSent={reload} />
    </div>
  );
}
