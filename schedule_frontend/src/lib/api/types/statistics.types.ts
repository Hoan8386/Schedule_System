/** Type – Thống kê theo vai trò (khớp StatisticsResponse ở backend) */

export interface StatStoreOption {
  storeId: number;
  storeName: string;
}

export interface StatSummary {
  employees: number;
  stores: number;
  scheduledShifts: number;
  completedShifts: number;
  pendingShifts: number;
  upcomingShifts: number;
  lateCount: number;
  absentCount: number;
  totalHours: number;
  totalWage: number;
  violationCount: number;
  totalPenalty: number;
  averageScore: number | null;
  /** % ca hoàn thành trên số ca đã qua (hoàn thành + vắng) */
  attendanceRate: number;
}

export interface StatStore {
  storeId: number;
  storeName: string;
  employees: number;
  scheduledShifts: number;
  completedShifts: number;
  lateCount: number;
  absentCount: number;
  totalHours: number;
  totalWage: number;
  violationCount: number;
  attendanceRate: number;
}

export interface StatDaily {
  date: string;
  shifts: number;
  hours: number;
  wage: number;
}

export interface StatEmployee {
  employeeId: number;
  employeeCode: string | null;
  fullName: string | null;
  stores: string;
  scheduledShifts: number;
  completedShifts: number;
  lateCount: number;
  absentCount: number;
  totalHours: number;
  totalWage: number;
  violationCount: number;
  totalPenalty: number;
  averageScore: number | null;
  attendanceRate: number;
}

export type WorkStatus = "COMPLETED" | "IN_PROGRESS" | "ABSENT" | "UPCOMING" | "PENDING" | "CANCELLED";

export interface StatShift {
  assignmentId: number;
  shiftByDateId: number;
  employeeId: number;
  employeeCode: string | null;
  employeeName: string | null;
  storeId: number;
  storeName: string | null;
  workDate: string | null;
  shiftName: string | null;
  startTime: string | null;
  endTime: string | null;
  assignmentStatus: string | null;
  attendanceStatus: string | null;
  checkInAt: string | null;
  checkOutAt: string | null;
  hours: number;
  payRate: number;
  wage: number;
  workStatus: WorkStatus;
}

export interface StatPayroll {
  recordedWage: number;
  approvedPayroll: number;
  paidPayroll: number;
  bonusAmount: number;
  penaltyAmount: number;
}

export interface StatOverview {
  from: string;
  to: string;
  stores: StatStoreOption[];
  summary: StatSummary;
  byStore: StatStore[];
  daily: StatDaily[];
  employees: StatEmployee[];
}

export interface StatPersonal {
  from: string;
  to: string;
  employeeId: number;
  employeeName: string | null;
  stores: StatStoreOption[];
  summary: StatSummary;
  daily: StatDaily[];
  shifts: StatShift[];
  payroll: StatPayroll;
}

export interface StatFilters {
  from?: string;
  to?: string;
  storeId?: number;
}

// ------------------------------------------------------------------ Trang tổng quan

/** REGISTER = đăng ký ca chờ duyệt; CHANGE / ADD / CANCEL = yêu cầu khẩn */
export interface DashRequest {
  id: number;
  requestType: string;
  employeeId: number;
  employeeCode: string | null;
  employeeName: string | null;
  storeName: string | null;
  workDate: string | null;
  shiftName: string | null;
  startTime: string | null;
  endTime: string | null;
  reason: string | null;
  requestedAt: string | null;
  status: string | null;
}

export interface DashViolation {
  id: number;
  employeeName: string | null;
  storeName: string | null;
  violationTime: string | null;
  title: string | null;
  description: string | null;
  penaltyAmount: number | null;
  status: string | null;
}

export interface DashTodo {
  id: number;
  title: string;
  description: string | null;
  priority: string | null;
  dueAt: string | null;
  status: string | null;
}

export interface DashShift {
  assignmentId: number;
  workDate: string | null;
  shiftName: string | null;
  startTime: string | null;
  endTime: string | null;
  storeName: string | null;
  plannedHours: number;
  payRate: number;
  estimatedWage: number;
  workStatus: WorkStatus;
}

export interface DashNotification {
  id: number;
  title: string;
  content: string | null;
  type: string | null;
  createdAt: string | null;
  read: boolean;
}

export interface DashAttendanceDay {
  date: string;
  onTime: number;
  late: number;
  absent: number;
}

export interface DashRound {
  id: number;
  roundName: string;
  storeName: string | null;
  registrationStartAt: string | null;
  registrationEndAt: string | null;
}

export interface ManagerDashboard {
  from: string;
  to: string;
  activeStores: number;
  totalStores: number;
  activeEmployees: number;
  todayShifts: number;
  pendingAssignments: number;
  pendingRequests: number;
  month: StatSummary;
  attendanceTrend: DashAttendanceDay[];
  requestStatus: Record<string, number>;
  byStore: StatStore[];
  recentRequests: DashRequest[];
  recentViolations: DashViolation[];
  newViolations: number;
  todos: DashTodo[];
}

export interface StoreManagerDashboard {
  from: string;
  to: string;
  managerName: string | null;
  stores: StatStoreOption[];
  month: StatSummary;
  todayShifts: number;
  pendingRegistrations: number;
  pendingChanges: number;
  pendingCancels: number;
  requestQueue: DashRequest[];
  myNextShift: DashShift | null;
  todos: DashTodo[];
  openRounds: DashRound[];
  attendanceTrend: DashAttendanceDay[];
}

export interface EmployeeDashboard {
  from: string;
  to: string;
  employeeName: string | null;
  month: StatSummary;
  nextShift: DashShift | null;
  weekShifts: DashShift[];
  pendingRequests: DashRequest[];
  notifications: DashNotification[];
  unreadNotifications: number;
  openRounds: DashRound[];
}
