/** Type – Chấm công, nội quy, vi phạm, thưởng */

export interface AttendanceResponse {
  id?: number;
  employee?: { id?: number; fullName?: string; employeeCode?: string } | number | null;
  employeeId?: number | null;
  shiftByDate?: { id?: number; workDate?: string } | number | null;
  shiftByDateId?: number | null;
  checkInAt?: string | null;
  checkInLatitude?: number | null;
  checkInLongitude?: number | null;
  checkInAccuracy?: number | null;
  attachmentId?: number | null;
  checkOutAt?: string | null;
  checkOutLatitude?: number | null;
  checkOutLongitude?: number | null;
  checkOutAccuracy?: number | null;
  workedHours?: number | null;
  attendanceStatus?: string | null;
  scheduleMatchStatus?: string | null;
  approvalStatus?: string | null;
  approvedBy?: number | null;
  approvedAt?: string | null;
  note?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  [key: string]: unknown;
}

export interface RuleResponse {
  ruleId?: number;
  ruleCode?: string | null;
  ruleName?: string | null;
  category?: string | null;
  description?: string | null;
  penaltyType?: string | null;
  penaltyAmount?: number | null;
  status?: string | null;
  [key: string]: unknown;
}

export interface ViolationResponse {
  violationId?: number;
  ruleId?: number | null;
  disciplinaryCodeId?: number | null;
  attendanceId?: number | null;
  violationTime?: string | null;
  description?: string | null;
  ruleName?: string | null;
  category?: string | null;
  penaltyType?: string | null;
  penaltyAmount?: number | null;
  status?: string | null;
  [key: string]: unknown;
}

export interface DisciplinaryRecordResponse {
  disciplinaryId?: number;
  storeId?: number | null;
  employeeId?: number | null;
  disciplinaryType?: string | null;
  amount?: number | null;
  reason?: string | null;
  status?: string | null;
  approvedAt?: string | null;
  [key: string]: unknown;
}

export interface BonusRecordResponse {
  bonusRecordId?: number;
  employeeId?: number | null;
  payrollMonth?: string | null;
  totalBonus?: number | null;
  totalPenalty?: number | null;
  totalAmount?: number | null;
  status?: string | null;
  [key: string]: unknown;
}

export interface BonusDetailResponse {
  bonusDetailId?: number;
  bonusRecordId?: number | null;
  ruleId?: number | null;
  type?: string | null;
  amount?: number | null;
  reason?: string | null;
  [key: string]: unknown;
}

/** Vai trò gửi / nhận phản hồi. */
export type FeedbackRole = "EMPLOYEE" | "STORE_MANAGER" | "MANAGER" | "ADMIN";
/** PENDING → REVIEWED | CLOSED; REVIEWED → RESOLVED; RESOLVED → REVIEWED | CLOSED; CLOSED là trạng thái cuối. */
export type FeedbackStatus = "PENDING" | "REVIEWED" | "RESOLVED" | "CLOSED";
/** SHIFT: Ca làm · EMPLOYEE: Đồng nghiệp · SYSTEM: Hệ thống (gửi admin) */
export type FeedbackType = "SHIFT" | "EMPLOYEE" | "SYSTEM";

export interface FeedbackItem {
  feedbackId: number;
  employeeId: number;
  senderName: string | null;
  senderCode: string | null;
  senderRole: FeedbackRole | null;
  targetRole: FeedbackRole;
  storeId: number | null;
  storeName: string | null;
  shiftByDateId: number | null;
  shiftLabel: string | null;
  feedbackType: FeedbackType;
  targetEmployeeId: number | null;
  targetEmployeeName: string | null;
  title: string | null;
  content: string;
  attachmentIdList: number[];
  /** Ảnh nhúng sẵn dạng data URL – chỉ có ở API chi tiết */
  attachments?: FeedbackImage[];
  status: FeedbackStatus;
  response: string | null;
  handledBy: number | null;
  handlerName: string | null;
  handledAt: string | null;
  createdAt: string | null;
  /** Phản hồi do chính người dùng hiện tại gửi */
  mine: boolean;
  /** Người dùng hiện tại được trả lời / xử lý phản hồi này */
  canReply: boolean;
  /** Trạng thái người dùng hiện tại được chuyển sang (rỗng nếu không có quyền / đã đóng) */
  nextStatuses: FeedbackStatus[];
}

export interface FeedbackColleague {
  employeeId: number;
  fullName: string | null;
  employeeCode: string | null;
}

export interface FeedbackImage {
  attachmentId: number;
  fileName: string | null;
  dataUrl: string | null;
}

export interface FeedbackCreateBody {
  feedbackType: FeedbackType;
  /** Bỏ trống với loại Hệ thống (luôn gửi admin) */
  targetRole?: FeedbackRole;
  targetEmployeeId?: number;
  title: string;
  content: string;
  storeId?: number;
  shiftByDateId?: number;
  attachmentIds?: number[];
}

export interface FeedbackReplyBody {
  status: Exclude<FeedbackStatus, "PENDING">;
  response?: string;
}
