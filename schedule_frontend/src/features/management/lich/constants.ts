import { localMinuteKey, minuteKey, text, upper } from "@/lib/format";

export type TabKey = "period" | "shift" | "calendar" | "round" | "session" | "group" | "event" | "emergency";
export type Kind = "period" | "shift" | "shiftDate" | "assignment" | "round" | "session" | "group" | "event" | "emergency";
export type CalendarView = "month" | "week";
export type Entity = Record<string, unknown>;

export const KIND_LABEL: Record<Kind, string> = {
  period: "kỳ lập lịch",
  shift: "ca mẫu",
  shiftDate: "ca theo ngày",
  assignment: "phân bổ nhân viên",
  round: "đợt đăng ký",
  session: "phiên đăng ký",
  group: "nhóm ca",
  event: "sự kiện đặc biệt",
  emergency: "yêu cầu khẩn",
};

export const STATUS_OPTIONS = {
  period: ["DRAFT", "OPEN", "CANCELLED", "FINALIZED"],
  round: ["OPEN", "CLOSED"],
  session: ["OPEN", "PENDING", "CLOSED"],
  shift: ["ACTIVE", "INACTIVE"],
  shiftDate: ["OPEN", "FULL", "CLOSED", "CANCELLED"],
  assignment: ["PENDING", "APPROVED", "REJECTED", "CANCELLED", "COMPLETED"],
  group: ["ACTIVE", "INACTIVE"],
  event: ["ACTIVE", "INACTIVE", "SCHEDULED", "CANCELLED"],
  emergency: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
} as const;

export const TYPE_OPTIONS = {
  period: ["WEEK", "MONTH"],
  event: ["SALE", "PROMOTION", "HOLIDAY", "SPECIAL"],
  emergency: ["CHANGE", "ADD", "CANCEL"],
} as const;

/** Phân bổ không còn hiệu lực */
export const INACTIVE_ASSIGNMENT = ["CANCELLED", "REJECTED"];

export const isActiveAssignment = (assignment: { status?: unknown }) => !INACTIVE_ASSIGNMENT.includes(upper(assignment.status));

export const SHIFT_DATE_STATUS: Record<string, { label: string; card: string; badge: string }> = {
  OPEN: { label: "Đang mở", card: "border-emerald-200 bg-emerald-50/70", badge: "bg-emerald-100 text-emerald-700" },
  FULL: { label: "Đã đủ người", card: "border-blue-200 bg-blue-50/70", badge: "bg-blue-100 text-blue-700" },
  CLOSED: { label: "Đã đóng", card: "border-slate-200 bg-slate-100", badge: "bg-slate-200 text-slate-600" },
  CANCELLED: { label: "Đã hủy", card: "border-rose-200 bg-rose-50 line-through opacity-70", badge: "bg-rose-100 text-rose-700" },
};

const ASSIGNMENT_STATUS: Record<string, { label: string; badge: string }> = {
  PENDING: { label: "Chờ duyệt", badge: "bg-brand-100 text-brand-700" },
  APPROVED: { label: "Đã duyệt", badge: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "Từ chối", badge: "bg-rose-100 text-rose-700" },
  CANCELLED: { label: "Đã hủy", badge: "bg-slate-200 text-slate-600" },
  COMPLETED: { label: "Hoàn thành", badge: "bg-blue-100 text-blue-700" },
};

export const shiftDateStyle = (status: unknown) =>
  SHIFT_DATE_STATUS[upper(status)] ?? { label: text(status), card: "border-slate-200 bg-slate-50", badge: "bg-slate-100 text-slate-600" };

export const assignmentStyle = (status: unknown) =>
  ASSIGNMENT_STATUS[upper(status)] ?? { label: text(status), badge: "bg-slate-100 text-slate-600" };

export const WEEKDAY_SHORT = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
export const WEEKDAY_LONG = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
export const MONTH_HEADER = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"];

export const SLOTS = [
  { label: "Ca sáng", hint: "Bắt đầu trước 12:00" },
  { label: "Ca chiều", hint: "12:00 – 16:59" },
  { label: "Ca tối", hint: "Từ 17:00" },
];

/** Id của bản ghi bất kể backend đặt tên khóa thế nào. */
export const idOf = (item: Entity) =>
  Number(
    item.id ??
      item.schedulePeriodId ??
      item.shiftId ??
      item.shiftByDateId ??
      item.shiftAssignmentId ??
      item.scheduleRoundId ??
      item.scheduleSessionId ??
      item.shiftGroupId ??
      item.eventId ??
      item.emergencyRequestId ??
      item.roundId ??
      item.sessionId ??
      0
  );

/** Trạng thái theo thời gian: sắp mở / đang diễn ra / đã kết thúc */
export const phaseOf = (start: unknown, end: unknown) => {
  const now = localMinuteKey(new Date());
  const from = minuteKey(start);
  const to = minuteKey(end);
  if (from && now < from) return { label: "Sắp mở", badge: "bg-sky-100 text-sky-700" };
  if (to && now > to) return { label: "Đã kết thúc", badge: "bg-slate-200 text-slate-600" };
  return { label: "Đang diễn ra", badge: "bg-emerald-100 text-emerald-700" };
};

export const periodTypeLabel = (type: unknown) => (type === "WEEK" ? "Tuần" : type === "MONTH" ? "Tháng" : text(type));
