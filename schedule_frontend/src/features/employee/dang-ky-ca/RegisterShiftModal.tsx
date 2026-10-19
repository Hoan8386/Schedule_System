"use client";

import React from "react";
import { CalendarCheck, CalendarX, Clock3, Store, Users, Wallet } from "lucide-react";
import { Button, Modal } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import { WEEKDAY_LONG } from "@/features/management/lich/constants";
import { formatHours, formatVnd } from "@/features/statistics/utils";
import { shiftHours } from "./model";
import type { Cell, TemplateRow } from "./RegisterTimetable";

interface Props {
  row: TemplateRow;
  dayKey: string;
  cell: Cell;
  submitting: boolean;
  onClose: () => void;
  onRegister: () => void;
  onCancel: () => void;
}

const STATUS_BADGE: Partial<Record<Cell["kind"], { label: string; className: string }>> = {
  pending: { label: "Chờ quản lý duyệt", className: "bg-amber-100 text-amber-800" },
  approved: { label: "Quản lý đã duyệt", className: "bg-emerald-100 text-emerald-800" },
  available: { label: "Còn chỗ", className: "bg-brand-100 text-brand-800" },
};

/** Popup một ô ca × ngày: thông tin ca và nút đăng ký / hủy đăng ký (khi còn chờ duyệt và phiên còn mở). */
export function RegisterShiftModal({ row, dayKey, cell, submitting, onClose, onRegister, onCancel }: Props) {
  const { shift, group } = row;
  const startTime = cell.shiftByDate?.startTime ?? shift.startTime;
  const endTime = cell.shiftByDate?.endTime ?? shift.endTime;
  const hours = shiftHours(startTime, endTime);
  const payRate = cell.shiftByDate?.payRate ?? shift.payRate;
  const date = new Date(`${dayKey}T00:00:00`);
  const badge = STATUS_BADGE[cell.kind] ?? { label: cell.note, className: "bg-slate-100 text-slate-600" };

  const canRegister = cell.kind === "available";
  const canCancel = cell.kind === "pending" && Boolean(cell.cancellable);

  const info = [
    { icon: Clock3, label: "Giờ làm", value: `${startTime ?? "—"} – ${endTime ?? "—"} · ${formatHours(hours)}` },
    { icon: Users, label: "Đã đăng ký", value: `${cell.count} / ${cell.capacity} người` },
    { icon: Wallet, label: "Lương dự kiến", value: `${formatVnd(Math.round(hours * payRate))} (${formatVnd(payRate)}/giờ)` },
    { icon: Store, label: "Cửa hàng · nhóm ca", value: `${group.storeName ?? "—"} · ${group.shiftGroupName ?? "—"}` },
  ];

  return (
    <Modal
      open
      title={canCancel ? "Hủy đăng ký ca" : "Đăng ký ca"}
      onClose={submitting ? () => undefined : onClose}
      size="max-w-md"
      footer={
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Đóng
          </Button>
          {canRegister && (
            <Button icon={CalendarCheck} onClick={onRegister} disabled={submitting}>
              {submitting ? "Đang đăng ký..." : "Đăng ký ca"}
            </Button>
          )}
          {canCancel && (
            <Button variant="danger" icon={CalendarX} onClick={onCancel} disabled={submitting}>
              {submitting ? "Đang hủy..." : "Hủy đăng ký"}
            </Button>
          )}
        </div>
      }
    >
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-base font-black text-slate-900">
              {shift.shiftName ?? "Ca"}
              {shift.shiftCode && <span className="ml-1.5 text-xs font-semibold text-slate-400">{shift.shiftCode}</span>}
            </p>
            <p className="mt-0.5 text-xs font-semibold text-slate-600">
              {WEEKDAY_LONG[date.getDay()]}, {formatDate(dayKey)}
            </p>
          </div>
          <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold", badge.className)}>{badge.label}</span>
        </div>
        <dl className="mt-4 space-y-2.5">
          {info.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-2.5 text-xs">
              <Icon className="h-4 w-4 shrink-0 text-slate-400" />
              <dt className="w-32 shrink-0 text-slate-500">{label}</dt>
              <dd className="font-semibold text-slate-800">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <p className="text-xs text-slate-500">
        {canRegister && "Sau khi đăng ký, ca ở trạng thái chờ duyệt cho tới khi quản lý duyệt. Bạn có thể hủy trong thời gian phiên đăng ký còn mở."}
        {canCancel && "Đăng ký sẽ bị xóa và chỗ trống được trả lại cho người khác. Bạn có thể đăng ký lại khi phiên còn mở."}
        {cell.kind === "pending" && !canCancel && "Phiên đăng ký đã đóng nên không thể hủy. Vui lòng liên hệ quản lý nếu cần thay đổi."}
        {cell.kind === "approved" && "Ca đã được duyệt. Muốn hủy hoặc đổi ca, vui lòng gửi yêu cầu cho quản lý."}
        {!["available", "pending", "approved"].includes(cell.kind) && `Không thể đăng ký: ${cell.note}.`}
      </p>
    </Modal>
  );
}
