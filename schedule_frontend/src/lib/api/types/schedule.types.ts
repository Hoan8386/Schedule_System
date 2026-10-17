/** Type – Lịch & ca làm việc */

export interface SchedulePeriodResponse {
  id?: number;
  schedulePeriodId?: number;
  storeId?: number | null;
  periodName?: string | null;
  periodType?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  effectiveStartDate?: string | null;
  effectiveEndDate?: string | null;
  description?: string | null;
  registrationOpenAt?: string | null;
  registrationCloseAt?: string | null;
  status?: string | null;
  [key: string]: unknown;
}

/** Số bản ghi sẽ bị xóa cùng một kỳ lập lịch. */
export interface SchedulePeriodDeletePreview {
  rounds: number;
  sessions: number;
  shiftByDates: number;
  assignments: number;
  attendances: number;
  emergencyRequests: number;
  eventScopes: number;
}

export interface ShiftResponse {
  id?: number;
  shiftId?: number;
  storeId?: number | null;
  storeName?: string | null;
  shiftGroupId?: number | null;
  shiftGroupName?: string | null;
  shiftCode?: string | null;
  shiftName?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  maxCapacity?: number | null;
  payRate?: number | null;
  status?: string | null;
  note?: string | null;
  [key: string]: unknown;
}

export interface ShiftByDateResponse {
  id?: number;
  shiftByDateId?: number;
  shiftId?: number | null;
  schedulePeriodId?: number | null;
  scheduleRoundId?: number | null;
  roundName?: string | null;
  scheduleSessionId?: number | null;
  sessionName?: string | null;
  workDate?: string | null;
  capacity?: number | null;
  shiftName?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  maxCapacity?: number | null;
  payRate?: number | null;
  status?: string | null;
  managerNote?: string | null;
  storeId?: number | null;
  storeName?: string | null;
  [key: string]: unknown;
}

export interface ShiftAssignmentResponse {
  id?: number;
  shiftAssignmentId?: number;
  shiftByDateId?: number | null;
  employeeId?: number | null;
  status?: string | null;
  registeredAt?: string | null;
  approvedBy?: number | null;
  approvedAt?: string | null;
  cancelledBy?: number | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  note?: string | null;
  [key: string]: unknown;
}

export interface ScheduleRoundResponse {
  id?: number;
  scheduleRoundId?: number;
  roundName?: string | null;
  schedulePeriodId?: number | null;
  periodName?: string | null;
  storeId?: number | null;
  storeName?: string | null;
  registrationStartAt?: string | null;
  registrationEndAt?: string | null;
  description?: string | null;
  status?: string | null;
  createdBy?: number | null;
  createdAt?: string | null;
  [key: string]: unknown;
}

export interface ScheduleSessionResponse {
  id?: number;
  scheduleSessionId?: number;
  sessionName?: string | null;
  sessionOpenAt?: string | null;
  sessionCloseAt?: string | null;
  scheduleRoundId?: number | null;
  roundName?: string | null;
  shiftGroupId?: number | null;
  shiftGroupName?: string | null;
  description?: string | null;
  status?: string | null;
  createdBy?: number | null;
  createdAt?: string | null;
  [key: string]: unknown;
}

export interface ShiftGroupResponse {
  id?: number;
  shiftGroupId?: number;
  storeId?: number | null;
  storeName?: string | null;
  shiftGroupCode?: string | null;
  shiftGroupName?: string | null;
  description?: string | null;
  payRate?: number | null;
  status?: string | null;
  createdBy?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  /** Nhân viên đã gán vào nhóm (có ở API danh sách) */
  employeeIds?: number[];
  [key: string]: unknown;
}

export interface SpecialEventResponse {
  id?: number;
  eventId?: number;
  eventName?: string | null;
  description?: string | null;
  eventType?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: string | null;
  createdBy?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  [key: string]: unknown;
}

export interface EmergencyRequestResponse {
  id?: number;
  emergencyRequestId?: number;
  employeeId?: number | null;
  requestType?: string | null;
  sourceAssignmentId?: number | null;
  targetAssignmentId?: number | null;
  reason?: string | null;
  status?: string | null;
  createdAt?: string | null;
  processedAt?: string | null;
  [key: string]: unknown;
}

// ------------------------------------------------------------------ Nhóm ca của nhân viên đang đăng nhập

export interface MyGroupShift {
  shiftId: number;
  shiftCode: string | null;
  shiftName: string | null;
  startTime: string | null;
  endTime: string | null;
  payRate: number;
  /** Sức chứa mặc định khi ngày đó chưa có ca theo ngày */
  maxCapacity: number | null;
}

export interface MyShiftGroup {
  shiftGroupId: number;
  shiftGroupCode: string | null;
  shiftGroupName: string | null;
  description: string | null;
  storeId: number;
  storeName: string | null;
  shifts: MyGroupShift[];
}

/** Ca theo ngày đang mở của nhóm; myAssignmentStatus = trạng thái đăng ký của chính nhân viên (null nếu chưa) */
export interface MyOpenShift {
  shiftByDateId: number;
  shiftId: number;
  shiftGroupId: number;
  shiftGroupName: string | null;
  workDate: string;
  shiftName: string | null;
  startTime: string | null;
  endTime: string | null;
  storeName: string | null;
  registeredCount: number;
  maxCapacity: number | null;
  payRate: number;
  myAssignmentStatus: string | null;
  /** Trạng thái ca theo ngày; chỉ OPEN mới đăng ký được */
  status: string | null;
}

export interface RegistrationSession {
  sessionId: number;
  sessionName: string;
  shiftGroupId: number | null;
  shiftGroupName: string | null;
  openAt: string | null;
  closeAt: string | null;
  status: string | null;
}

/** Đợt đăng ký; không có phiên = mọi nhóm ca đăng ký trong cả đợt */
export interface RegistrationRound {
  roundId: number;
  roundName: string;
  storeName: string | null;
  registrationStartAt: string | null;
  registrationEndAt: string | null;
  status: string | null;
  sessions: RegistrationSession[];
}

/** Kỳ lịch đang mở kèm đợt / phiên đăng ký liên quan tới nhân viên */
export interface RegistrationPeriod {
  periodId: number;
  periodName: string;
  periodType: string | null;
  startDate: string | null;
  endDate: string | null;
  effectiveStartDate: string | null;
  effectiveEndDate: string | null;
  status: string | null;
  rounds: RegistrationRound[];
}

export interface MyShiftGroups {
  from: string;
  to: string;
  groups: MyShiftGroup[];
  openShifts: MyOpenShift[];
  periods: RegistrationPeriod[];
}
