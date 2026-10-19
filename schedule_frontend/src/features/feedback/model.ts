import { useEffect, useState } from "react";
import { Building2, Calendar, Monitor, ShieldCheck, Store, Users, MessageSquare } from "lucide-react";
import { type FeedbackItem, type FeedbackRole, type FeedbackStatus, type FeedbackType } from "@/lib/api";

/** Đối tượng mà từng vai trò được gửi phản hồi tới (khớp FeedbackService.ALLOWED_TARGETS). */
export const TARGETS_BY_ROLE: Record<FeedbackRole, FeedbackRole[]> = {
  EMPLOYEE: ["STORE_MANAGER", "MANAGER", "ADMIN"],
  STORE_MANAGER: ["MANAGER", "ADMIN"],
  MANAGER: ["ADMIN"],
  ADMIN: [],
};

export const TARGET_META: Record<FeedbackRole, { label: string; hint: string; icon: typeof Store }> = {
  EMPLOYEE: { label: "Nhân viên", hint: "", icon: Users },
  STORE_MANAGER: { label: "Trưởng cửa hàng", hint: "Vấn đề tại cửa hàng, ca làm, vật tư", icon: Store },
  MANAGER: { label: "Quản lý chuỗi", hint: "Chính sách, lương thưởng, nhân sự", icon: Building2 },
  ADMIN: { label: "Quản trị viên", hint: "Lỗi hệ thống, tài khoản, đề xuất tính năng", icon: ShieldCheck },
};

export const ROLE_LABEL: Record<FeedbackRole, string> = {
  EMPLOYEE: "Nhân viên",
  STORE_MANAGER: "Trưởng cửa hàng",
  MANAGER: "Quản lý",
  ADMIN: "Admin",
};

export const TYPE_META: Record<FeedbackType, { label: string; icon: typeof Store }> = {
  SHIFT: { label: "Ca làm", icon: Calendar },
  SYSTEM: { label: "Hệ thống", icon: Monitor },
  EMPLOYEE: { label: "Đồng nghiệp", icon: Users },
  OTHER: { label: "Khác", icon: MessageSquare },
};

export const STATUS_META: Record<FeedbackStatus, { label: string; className: string }> = {
  PENDING: { label: "Chờ xử lý", className: "bg-brand-50 text-brand-700 border-brand-200" },
  PROCESSING: { label: "Đang xử lý", className: "bg-blue-50 text-blue-700 border-blue-200" },
  RESOLVED: { label: "Đã trả lời", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  REJECTED: { label: "Từ chối", className: "bg-slate-100 text-slate-600 border-slate-200" },
};

export const statusMeta = (status: string | null | undefined) => STATUS_META[status as FeedbackStatus] ?? STATUS_META.PENDING;
export const typeMeta = (type: string | null | undefined) => TYPE_META[type as FeedbackType] ?? TYPE_META.OTHER;
export const targetMeta = (role: string | null | undefined) => TARGET_META[role as FeedbackRole] ?? TARGET_META.STORE_MANAGER;

export const feedbackCode = (item: FeedbackItem) => `PH-${String(item.feedbackId).padStart(3, "0")}`;

export const MAX_IMAGES = 5;
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

/** Khoảng thời gian diễn ra ca (ca qua đêm tính sang ngày hôm sau); null nếu thiếu dữ liệu. */
function shiftWindow(workDate: string | null, startTime: string | null, endTime: string | null) {
  if (!workDate || !startTime || !endTime) return null;
  const [y, mo, d] = workDate.split("-").map(Number);
  const at = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return new Date(y, mo - 1, d, h, m || 0);
  };
  const from = at(startTime);
  const to = at(endTime);
  if (to <= from) to.setDate(to.getDate() + 1);
  return { from, to };
}

/**
 * Chỉ phản hồi được ca đã được duyệt (APPROVED) và đang trong giờ làm của ca
 * (khớp FeedbackService.requireShiftFeedbackWindow).
 */
export function isShiftFeedbackOpen(
  shift: { assignmentStatus: string | null; workDate: string | null; startTime: string | null; endTime: string | null },
  now: Date
) {
  if ((shift.assignmentStatus ?? "").toUpperCase() !== "APPROVED") return false;
  const range = shiftWindow(shift.workDate, shift.startTime, shift.endTime);
  return Boolean(range && now >= range.from && now <= range.to);
}

/** Thời điểm hiện tại, tự cập nhật mỗi phút để nút phản hồi ca bật / tắt đúng giờ. */
export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);
  return now;
}
