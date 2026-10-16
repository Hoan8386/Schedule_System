import React, { useState } from "react";
import { Check, X } from "lucide-react";
import { managerApi, type ShiftAssignmentResponse } from "@/lib/api";
import { formatDateTime, relId, upper } from "@/lib/format";
import { assignmentStyle } from "../constants";
import { useSchedule } from "../ScheduleContext";
import { EntityActions } from "../components/EntityActions";
import { assignmentId } from "../useScheduleLookups";

/** Một nhân viên được phân bổ vào ca, kèm nút duyệt / từ chối. */
export function AssignmentRow({ assignment }: { assignment: ShiftAssignmentResponse }) {
  const { lookups, reload, setError } = useSchedule();
  const [busy, setBusy] = useState(false);
  const style = assignmentStyle(assignment.status);
  const isPending = upper(assignment.status) === "PENDING";

  const decide = async (status: "APPROVED" | "REJECTED") => {
    const id = assignmentId(assignment);
    if (!id) return;
    setBusy(true);
    setError("");
    try {
      // Backend cập nhật toàn bộ bản ghi nên gửi kèm ca và nhân viên; người duyệt / thời điểm do backend ghi nhận.
      await managerApi.updateShiftAssignment(id, {
        shiftByDate: relId(assignment, "shiftByDate"),
        employee: relId(assignment, "employee"),
        status,
        note: assignment.note ?? undefined,
      });
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể cập nhật phân bổ");
    } finally {
      setBusy(false);
    }
  };

  const approval = assignment.approvedAt || assignment.approvedBy
    ? ` · Duyệt ${assignment.approvedBy ? `bởi ${lookups.employeeName(assignment.approvedBy)} ` : ""}${assignment.approvedAt ? formatDateTime(assignment.approvedAt) : ""}`
    : "";
  const cancellation = assignment.cancelledAt || assignment.cancelledBy
    ? ` · Hủy ${assignment.cancelledBy ? `bởi ${lookups.employeeName(assignment.cancelledBy)} ` : ""}${assignment.cancelledAt ? formatDateTime(assignment.cancelledAt) : ""}`
    : "";

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-slate-800">{lookups.employeeName(relId(assignment, "employee"))}</p>
        <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${style.badge}`}>{style.label}</span>
        <p className="mt-1 text-[10px] text-slate-400">
          {assignment.registeredAt ? `Đăng ký ${formatDateTime(assignment.registeredAt)}` : ""}
          {approval}
          {cancellation}
        </p>
        {assignment.cancellationReason && <p className="text-[10px] text-rose-500">Lý do hủy: {assignment.cancellationReason}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {isPending && (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => void decide("APPROVED")}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2 py-1.5 text-[11px] font-bold text-emerald-700 disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" /> Duyệt
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void decide("REJECTED")}
              className="inline-flex items-center gap-1 rounded-lg bg-rose-100 px-2 py-1.5 text-[11px] font-bold text-rose-700 disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" /> Từ chối
            </button>
          </>
        )}
        <EntityActions kind="assignment" item={assignment} />
      </div>
    </div>
  );
}
