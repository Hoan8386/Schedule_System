"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Info, Send } from "lucide-react";
import { Button, EmptyState, Field, Modal, Select, Spinner, Textarea } from "@/components/ui";
import { employeeApi, type ShiftByDateResponse } from "@/lib/api";
import { localKey } from "@/lib/format";
import { REQUEST_META, addDays, shiftLabel, useMyShifts, type ShiftRequestType } from "./model";

interface ShiftRequestModalProps {
  type: ShiftRequestType;
  open: boolean;
  onClose: () => void;
  onSent?: () => void;
}

/** Form tạo yêu cầu đổi ca / hủy ca với dữ liệu ca thật của nhân viên. */
export default function ShiftRequestModal({ type, open, onClose, onSent }: ShiftRequestModalProps) {
  if (!open) return null;
  return <ShiftRequestForm type={type} onClose={onClose} onSent={onSent} />;
}

function ShiftRequestForm({ type, onClose, onSent }: Omit<ShiftRequestModalProps, "open">) {
  const meta = REQUEST_META[type];
  const { shifts, loading } = useMyShifts();
  const [assignmentId, setAssignmentId] = useState<number | undefined>();
  const [targetId, setTargetId] = useState<number | undefined>();
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [openShifts, setOpenShifts] = useState<ShiftByDateResponse[]>([]);

  // Chỉ ca sắp tới, đã được phân và chưa có yêu cầu đổi / hủy đang chờ
  const todayKey = localKey(new Date());
  const upcoming = useMemo(
    () =>
      shifts
        .filter((shift) => shift.workStatus === "UPCOMING" && !shift.pendingRequestType && (shift.workDate ?? "") >= todayKey)
        .sort((a, b) => `${a.workDate}${a.startTime}`.localeCompare(`${b.workDate}${b.startTime}`)),
    [shifts, todayKey]
  );
  const current = upcoming.find((shift) => shift.assignmentId === assignmentId) ?? upcoming[0];

  // Ca còn mở ở cùng cửa hàng để đổi sang (bỏ các ca mình đã có)
  const currentStoreId = current?.storeId;
  useEffect(() => {
    if (type !== "CHANGE" || !currentStoreId) return;
    let active = true;
    const today = new Date();
    employeeApi
      .getShiftsByDate({ from: localKey(today), to: localKey(addDays(today, 30)), storeId: currentStoreId, status: "OPEN" })
      .then(({ data }) => active && setOpenShifts(data ?? []))
      .catch(() => active && setOpenShifts([]));
    return () => {
      active = false;
    };
  }, [type, currentStoreId]);

  const mine = useMemo(() => new Set(shifts.map((shift) => shift.shiftByDateId)), [shifts]);
  const targets = useMemo(
    () =>
      openShifts
        .map((shift) => ({ ...shift, shiftByDateId: Number(shift.shiftByDateId ?? shift.id) }))
        .filter((shift) => shift.shiftByDateId && !mine.has(shift.shiftByDateId) && (shift.workDate ?? "") >= todayKey)
        .sort((a, b) => `${a.workDate}${a.startTime}`.localeCompare(`${b.workDate}${b.startTime}`)),
    [openShifts, mine, todayKey]
  );
  const target = targets.find((shift) => shift.shiftByDateId === targetId) ?? targets[0];

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!current || !reason.trim() || (type === "CHANGE" && !target)) return;
    setSubmitting(true);
    try {
      await employeeApi.createEmergencyRequest({
        assignmentId: current.assignmentId,
        requestType: type,
        ...(type === "CHANGE" ? { fromShiftAssignmentId: current.assignmentId, toAssignmentId: target?.shiftByDateId } : {}),
        reason: reason.trim(),
      });
      onSent?.();
      onClose();
    } catch {
      // Lỗi đã được hiện bằng toast từ HTTP client
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={meta.action.replace("Tạo y", "Y")} size="max-w-lg">
      {loading ? (
        <Spinner className="py-8" label="Đang tải ca của bạn..." />
      ) : upcoming.length === 0 ? (
        <EmptyState>Bạn không có ca sắp tới nào có thể {type === "CHANGE" ? "đổi" : "hủy"}.</EmptyState>
      ) : (
        <form onSubmit={submit} className="space-y-4 text-xs">
          <Field label={<span>Ca hiện tại <span className="text-rose-500">*</span></span>}>
            <Select
              value={current?.assignmentId ?? ""}
              onChange={(event) => {
                setAssignmentId(Number(event.target.value));
                setTargetId(undefined);
              }}
              options={upcoming.map((shift) => ({ value: shift.assignmentId, label: shiftLabel(shift) }))}
            />
          </Field>

          {type === "CHANGE" && (
            <Field label={<span>Ca muốn đổi sang <span className="text-rose-500">*</span></span>}>
              {targets.length ? (
                <Select
                  value={target?.shiftByDateId ?? ""}
                  onChange={(event) => setTargetId(Number(event.target.value))}
                  options={targets.map((shift) => ({
                    value: shift.shiftByDateId,
                    label: `${shiftLabel(shift)}${shift.maxCapacity ? ` · tối đa ${shift.maxCapacity} NV` : ""}`,
                  }))}
                />
              ) : (
                <p className="rounded-xl border border-dashed border-slate-200 px-3 py-2.5 font-medium text-slate-400">
                  Không có ca nào còn mở tại cửa hàng này trong 30 ngày tới.
                </p>
              )}
            </Field>
          )}

          <Field label={<span>Lý do <span className="text-rose-500">*</span></span>}>
            <Textarea
              rows={3}
              required
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={type === "CHANGE" ? "Vì sao bạn cần đổi ca?" : "Vì sao bạn không thể làm ca này?"}
              className="resize-y"
            />
          </Field>

          <div className="flex items-start gap-2.5 rounded-xl border border-brand-200/80 bg-brand-50/70 p-3 text-brand-900">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
            <p className="text-[11px] leading-relaxed">
              {type === "CHANGE"
                ? "Bạn vẫn làm ca hiện tại nếu yêu cầu chưa được duyệt. Ca mới chỉ được xác nhận sau khi quản lý đồng ý."
                : "Nếu được duyệt, ca này sẽ bị gỡ khỏi lịch và không tính vào tiền công. Bạn vẫn phải làm ca nếu yêu cầu chưa được duyệt."}
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
            <Button variant="secondary" onClick={onClose}>
              Đóng
            </Button>
            <Button type="submit" icon={Send} disabled={submitting || !reason.trim() || (type === "CHANGE" && !target)}>
              {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
