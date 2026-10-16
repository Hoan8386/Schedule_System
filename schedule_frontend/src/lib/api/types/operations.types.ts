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
