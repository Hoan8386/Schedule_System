import type { ShiftByDateResponse } from "@/lib/api";

export interface ShiftItem {
  id: string;
  day: string;
  shiftName: string;
  shiftHours: string;
  store: string;
  registeredCount: number;
  capacity: number;
  ratePerShift: string;
  hoursDetail: string;
  status: "REGISTERED" | "FULL" | "AVAILABLE";
}

/** Ca mở đăng ký -> dòng hiển thị, đánh dấu ca nhân viên đã đăng ký. */
export function toShiftItem(item: ShiftByDateResponse, registeredIds: Set<number | null | undefined>): ShiftItem {
  const id = item.shiftByDateId ?? item.id ?? 0;
  const capacity = item.maxCapacity ?? 0;
  const current = item.capacity ?? 0;
  const start = item.startTime?.slice(0, 5) ?? "";
  const end = item.endTime?.slice(0, 5) ?? "";
  return {
    id: String(id),
    day: item.workDate ?? "",
    shiftName: item.shiftName ?? "Ca làm việc",
    shiftHours: `${start} – ${end}`,
    store: item.storeName ?? "Cửa hàng",
    registeredCount: current,
    capacity,
    ratePerShift: `${Number(item.payRate ?? 0).toLocaleString("vi-VN")} VND`,
    hoursDetail: start && end ? "Theo cấu hình ca" : "",
    status: registeredIds.has(item.shiftByDateId) ? "REGISTERED" : current >= capacity && capacity > 0 ? "FULL" : "AVAILABLE",
  };
}

export const SHIFT_STATUS: Record<ShiftItem["status"], { label: string; badge: string; button: string }> = {
  REGISTERED: { label: "Đã đăng ký", badge: "border border-slate-200 bg-slate-100 text-slate-600", button: "text-slate-400" },
  FULL: { label: "Hết chỗ", badge: "bg-slate-100 text-slate-400", button: "text-slate-300" },
  AVAILABLE: { label: "Còn chỗ", badge: "border border-brand-200 bg-brand-50 text-brand-700", button: "" },
};
