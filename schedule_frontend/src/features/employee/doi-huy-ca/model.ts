import { useEffect, useState } from "react";
import {
  employeeApi,
  statisticsApi,
  type MyOpenShift,
  type StatShift,
} from "@/lib/api";
import { localKey } from "@/lib/format";

/** Yêu cầu sau khi hết thời gian đăng ký: thêm / đổi / hủy ca (gửi quản lý duyệt). */
export type ShiftRequestType = "ADD" | "CHANGE" | "CANCEL";

export const REQUEST_META: Record<
  ShiftRequestType,
  { title: string; description: string; submit: string }
> = {
  ADD: {
    title: "Thêm ca",
    description:
      "Đăng ký thêm một ca của nhóm khi đã hết thời gian đăng ký. Ca chỉ được tính khi quản lý duyệt.",
    submit: "Gửi yêu cầu thêm ca",
  },
  CHANGE: {
    title: "Đổi ca",
    description:
      "Đổi ca đã được duyệt sang ca khác cùng cửa hàng. Bạn vẫn làm ca cũ cho đến khi yêu cầu được duyệt.",
    submit: "Gửi yêu cầu đổi ca",
  },
  CANCEL: {
    title: "Hủy ca",
    description:
      "Hủy ca đã được duyệt. Bạn vẫn phải làm ca nếu yêu cầu chưa được duyệt.",
    submit: "Gửi yêu cầu hủy ca",
  },
};

export const STATUS_META: Record<string, { label: string; className: string }> =
  {
    PENDING: {
      label: "Chờ duyệt",
      className: "bg-brand-50 text-brand-700 border-brand-200",
    },
    APPROVED: {
      label: "Đã duyệt",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    REJECTED: {
      label: "Từ chối",
      className: "bg-rose-50 text-rose-700 border-rose-200",
    },
    CANCELLED: {
      label: "Đã hủy",
      className: "bg-slate-100 text-slate-600 border-slate-200",
    },
    COMPLETED: {
      label: "Đã làm",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },
  };

export const statusMeta = (status: unknown) =>
  STATUS_META[String(status ?? "").toUpperCase()] ?? STATUS_META.PENDING;

export const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

const dayMonth = (workDate: string | null | undefined) =>
  workDate ? workDate.split("-").reverse().slice(0, 2).join("/") : "";

/** "05/11 · Ca sáng · 08:00–14:00 · Cửa hàng Quận 1" */
export function shiftLabel(shift: {
  workDate?: string | null;
  shiftName?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  storeName?: string | null;
}) {
  return [
    dayMonth(shift.workDate),
    shift.shiftName ?? "Ca làm",
    `${(shift.startTime ?? "--:--").slice(0, 5)}–${(shift.endTime ?? "--:--").slice(0, 5)}`,
    shift.storeName,
  ]
    .filter(Boolean)
    .join(" · ");
}

/** Ca đã được phân của chính mình quanh hôm nay (60 ngày trước → 60 ngày tới). */
export function useMyShifts(version = 0) {
  const [shifts, setShifts] = useState<StatShift[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    const today = new Date();
    statisticsApi
      .getMine({
        from: localKey(addDays(today, -60)),
        to: localKey(addDays(today, 60)),
      })
      .then(({ data }) => active && setShifts(data.shifts ?? []))
      .catch(() => active && setShifts([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [version]);
  return { shifts, loading };
}

/** Ca theo ngày của các nhóm ca mình thuộc (60 ngày trước → 60 ngày tới) – dùng cho ca đích của Thêm / Đổi ca. */
export function useGroupShifts(version = 0) {
  const [shifts, setShifts] = useState<MyOpenShift[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    const today = new Date();
    employeeApi
      .getMyShiftGroups({
        from: localKey(addDays(today, -60)),
        to: localKey(addDays(today, 60)),
      })
      .then(({ data }) => active && setShifts(data.openShifts ?? []))
      .catch(() => active && setShifts([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [version]);
  return { shifts, loading };
}
