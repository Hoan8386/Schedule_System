import type { MyOpenShift } from "@/lib/api";

/** Đăng ký bị hủy / từ chối thì được đăng ký lại */
const INACTIVE = ["CANCELLED", "REJECTED"];

export const isRegistered = (shift: MyOpenShift) =>
  Boolean(shift.myAssignmentStatus) && !INACTIVE.includes(String(shift.myAssignmentStatus).toUpperCase());

/** Số giờ theo giờ bắt đầu / kết thúc của ca (ca qua đêm cộng 24h). */
export function shiftHours(start?: string | null, end?: string | null) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let minutes = eh * 60 + em - (sh * 60 + sm);
  if (minutes < 0) minutes += 24 * 60;
  return minutes / 60;
}
