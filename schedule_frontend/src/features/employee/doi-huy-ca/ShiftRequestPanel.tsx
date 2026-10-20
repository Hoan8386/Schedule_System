"use client";

import React, { useMemo, useState } from "react";
import { Info, Send } from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  EmptyState,
  Field,
  Select,
  Spinner,
  Textarea,
} from "@/components/ui";
import { employeeApi, type EmergencyRequestResponse } from "@/lib/api";
import { formatDateTime, localKey } from "@/lib/format";
import { cn } from "@/lib/cn";
import { useKeyedLoad } from "@/features/statistics/useStatistics";
import { isRegistered } from "../dang-ky-ca/model";
import {
  REQUEST_META,
  shiftLabel,
  statusMeta,
  useGroupShifts,
  useMyShifts,
  type ShiftRequestType,
} from "./model";

/**
 * Thêm / Đổi / Hủy ca sau khi hết thời gian đăng ký: form gửi yêu cầu + danh sách yêu cầu cùng loại đã gửi.
 * Cùng một giao diện, chỉ phần chọn ca thay đổi theo loại.
 */
export default function ShiftRequestPanel({
  type,
}: {
  type: ShiftRequestType;
}) {
  const meta = REQUEST_META[type];
  const [version, setVersion] = useState(0);
  const { shifts: myShifts, loading: loadingMine } = useMyShifts(version);
  const { shifts: groupShifts, loading: loadingGroup } =
    useGroupShifts(version);
  const requests = useKeyedLoad(
    `requests|${version}`,
    () => employeeApi.getEmergencyRequests(),
    "Không thể tải yêu cầu",
  );

  const [assignmentId, setAssignmentId] = useState<number | undefined>();
  const [targetId, setTargetId] = useState<number | undefined>();
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const todayKey = localKey(new Date());
  const pendingSources = useMemo(
    () =>
      new Set(
        (requests.data ?? [])
          .filter(
            (item) => String(item.status ?? "").toUpperCase() === "PENDING",
          )
          .map((item) => Number(item.assignmentId)),
      ),
    [requests.data],
  );

  // Ca hiện tại (Đổi / Hủy): ca đã duyệt, sắp tới, chưa có yêu cầu chờ duyệt
  const sources = useMemo(
    () =>
      myShifts
        .filter(
          (shift) =>
            String(shift.assignmentStatus ?? "").toUpperCase() === "APPROVED" &&
            (shift.workDate ?? "") >= todayKey &&
            !pendingSources.has(shift.assignmentId),
        )
        .sort((a, b) =>
          `${a.workDate}${a.startTime}`.localeCompare(
            `${b.workDate}${b.startTime}`,
          ),
        ),
    [myShifts, todayKey, pendingSources],
  );
  const source =
    type === "ADD"
      ? undefined
      : (sources.find((shift) => shift.assignmentId === assignmentId) ??
        sources[0]);

  // Ca đích (Thêm / Đổi): ca theo ngày của nhóm mình, sắp tới, mình chưa có; Đổi ca thì cùng cửa hàng với ca hiện tại
  const targets = useMemo(
    () =>
      groupShifts
        .filter(
          (shift) =>
            shift.workDate >= todayKey &&
            !isRegistered(shift) &&
            (type !== "CHANGE" ||
              (source &&
                shift.storeName === source.storeName &&
                shift.shiftByDateId !== source.shiftByDateId)),
        )
        .sort((a, b) =>
          `${a.workDate}${a.startTime}`.localeCompare(
            `${b.workDate}${b.startTime}`,
          ),
        ),
    [groupShifts, todayKey, type, source],
  );
  const target =
    type === "CANCEL"
      ? undefined
      : (targets.find((shift) => shift.shiftByDateId === targetId) ??
        targets[0]);

  const ready =
    Boolean(reason.trim()) &&
    (type === "ADD"
      ? Boolean(target)
      : Boolean(source) && (type === "CANCEL" || Boolean(target)));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!ready) return;
    setSubmitting(true);
    try {
      await employeeApi.createEmergencyRequest({
        requestType: type,
        assignmentId: source?.assignmentId,
        toAssignmentId: target?.shiftByDateId,
        reason: reason.trim(),
      });
      setReason("");
      setAssignmentId(undefined);
      setTargetId(undefined);
      setVersion((value) => value + 1);
    } catch {
      // Lỗi đã được hiện bằng toast từ HTTP client
    } finally {
      setSubmitting(false);
    }
  };

  // Nhãn ca cho danh sách yêu cầu đã gửi
  const byAssignment = useMemo(
    () => new Map(myShifts.map((shift) => [shift.assignmentId, shift])),
    [myShifts],
  );
  const byShiftDate = useMemo(
    () => new Map(groupShifts.map((shift) => [shift.shiftByDateId, shift])),
    [groupShifts],
  );
  const mine = useMemo(
    () =>
      (requests.data ?? [])
        .filter((item) => String(item.requestType ?? "").toUpperCase() === type)
        .sort((a, b) =>
          String(b.requestedAt ?? "").localeCompare(
            String(a.requestedAt ?? ""),
          ),
        ),
    [requests.data, type],
  );
  const describe = (item: EmergencyRequestResponse) => {
    const from = byAssignment.get(Number(item.assignmentId));
    const to = byShiftDate.get(Number(item.toAssignmentId));
    return {
      from: from
        ? shiftLabel(from)
        : item.assignmentId
          ? `Phân ca #${String(item.assignmentId)}`
          : null,
      to: to
        ? shiftLabel(to)
        : item.toAssignmentId
          ? `Ca #${String(item.toAssignmentId)}`
          : null,
    };
  };

  const loading = loadingMine || loadingGroup;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <CardHeader title={meta.title} icon={Send} />
        <form onSubmit={submit} className="space-y-4 p-5 text-xs">
          <p className="text-slate-500">{meta.description}</p>
          {loading ? (
            <Spinner className="py-6" label="Đang tải ca của bạn..." />
          ) : (
            <>
              {type !== "ADD" && (
                <Field
                  label={
                    <span>
                      Ca hiện tại <span className="text-rose-500">*</span>
                    </span>
                  }
                >
                  {sources.length ? (
                    <Select
                      value={source?.assignmentId ?? ""}
                      onChange={(event) => {
                        setAssignmentId(Number(event.target.value));
                        setTargetId(undefined);
                      }}
                      options={sources.map((shift) => ({
                        value: shift.assignmentId,
                        label: shiftLabel(shift),
                      }))}
                    />
                  ) : (
                    <EmptyHint>
                      Bạn không có ca đã duyệt sắp tới nào (hoặc ca đã có yêu
                      cầu đang chờ duyệt).
                    </EmptyHint>
                  )}
                </Field>
              )}

              {type !== "CANCEL" && (
                <Field
                  label={
                    <span>
                      {type === "ADD" ? "Ca muốn thêm" : "Ca muốn đổi sang"}{" "}
                      <span className="text-rose-500">*</span>
                    </span>
                  }
                >
                  {targets.length ? (
                    <Select
                      value={target?.shiftByDateId ?? ""}
                      onChange={(event) =>
                        setTargetId(Number(event.target.value))
                      }
                      options={targets.map((shift) => ({
                        value: shift.shiftByDateId,
                        label: `${shiftLabel(shift)} · ${shift.registeredCount}${shift.maxCapacity ? `/${shift.maxCapacity}` : ""} NV`,
                      }))}
                    />
                  ) : (
                    <EmptyHint>
                      {type === "CHANGE" && !source
                        ? "Chọn ca hiện tại trước."
                        : "Không có ca nào của nhóm bạn để chọn trong 60 ngày tới."}
                    </EmptyHint>
                  )}
                </Field>
              )}

              <Field
                label={
                  <span>
                    Lý do <span className="text-rose-500">*</span>
                  </span>
                }
              >
                <Textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder={
                    type === "ADD"
                      ? "Vì sao bạn muốn thêm ca này?"
                      : type === "CHANGE"
                        ? "Vì sao bạn cần đổi ca?"
                        : "Vì sao bạn không thể làm ca này?"
                  }
                  className="resize-y"
                />
              </Field>

              <div className="flex items-start gap-2.5 rounded-xl border border-brand-200/80 bg-brand-50/70 p-3 text-brand-900">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                <p className="text-[11px] leading-relaxed">
                  Khi quản lý duyệt, lịch của bạn được cập nhật ngay:{" "}
                  {type === "ADD"
                    ? "ca mới được thêm"
                    : type === "CHANGE"
                      ? "ca cũ bị hủy và ca mới được thêm"
                      : "ca bị gỡ khỏi lịch"}
                  .
                </p>
              </div>

              <div className="flex justify-end border-t border-slate-100 pt-3">
                <Button
                  type="submit"
                  icon={Send}
                  disabled={submitting || !ready}
                >
                  {submitting ? "Đang gửi..." : meta.submit}
                </Button>
              </div>
            </>
          )}
        </form>
      </Card>

      <Card className="overflow-hidden lg:col-span-3">
        <CardHeader
          title={`Yêu cầu ${meta.title.toLowerCase()} đã gửi (${mine.length})`}
          icon={Info}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-400">
                {type !== "ADD" && <th className="px-4 py-3">Ca hiện tại</th>}
                {type !== "CANCEL" && (
                  <th className="px-4 py-3">
                    {type === "ADD" ? "Ca muốn thêm" : "Đổi sang"}
                  </th>
                )}
                <th className="px-4 py-3">Lý do</th>
                <th className="px-4 py-3">Gửi lúc</th>
                <th className="px-4 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {mine.map((item) => {
                const id = Number(item.emergencyRequestId ?? item.id);
                const labels = describe(item);
                const status = statusMeta(item.status);
                return (
                  <tr key={id}>
                    {type !== "ADD" && (
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {labels.from ?? "—"}
                      </td>
                    )}
                    {type !== "CANCEL" && (
                      <td className="px-4 py-3 text-slate-600">
                        {labels.to ?? "—"}
                      </td>
                    )}
                    <td className="max-w-xs px-4 py-3 text-slate-600">
                      {String(item.reason ?? "")}
                      {item.processNote ? (
                        <span className="mt-0.5 block text-[10px] text-slate-400">
                          Ghi chú: {String(item.processNote)}
                        </span>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                      {formatDateTime(item.requestedAt)}
                    </td>
                    <td className="px-4 py-3">
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
          {requests.loading && (
            <Spinner className="p-6" label="Đang tải yêu cầu..." />
          )}
          {!requests.loading && mine.length === 0 && (
            <EmptyState className="m-4">
              Bạn chưa gửi yêu cầu {meta.title.toLowerCase()} nào.
            </EmptyState>
          )}
        </div>
      </Card>
    </div>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-slate-200 px-3 py-2.5 font-medium text-slate-400">
      {children}
    </p>
  );
}
