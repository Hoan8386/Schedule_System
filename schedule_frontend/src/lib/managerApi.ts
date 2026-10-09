import { ApiResponse } from "@/lib/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function getHeaders(): Headers {
  const headers = new Headers({
    "Content-Type": "application/json",
    Accept: "application/json",
  });
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("bloan_access_token");
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
}

async function requestManagerApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: getHeaders(),
  });
  const text = await response.text();
  const json = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(
      (Array.isArray(json?.message) ? json.message.join(", ") : json?.message) ||
        json?.error ||
        text ||
        `Lỗi kết nối API (${response.status})`
    );
  }

  return {
    statusCode: response.status,
    error: json?.error ?? null,
    message: json?.message ?? "Call API Success",
    data: (json && "data" in json ? json.data : json) as T,
  };
}

export interface EmployeeResponse {
  id: number;
  userId?: number | null;
  employeeCode?: string | null;
  fullName?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  hireDate?: string | null;
  status?: string | null;
  note?: string | null;
  [key: string]: unknown;
}

export interface StoreResponse {
  id: number;
  storeCode?: string | null;
  storeName?: string | null;
  logoImage?: string | null;
  logoContentType?: string | null;
  address?: string | null;
  phone?: string | null;
  status?: string | null;
  note?: string | null;
  [key: string]: unknown;
}

export interface EmployeeStoreResponse {
  employeeStoreId: number;
  employeeId: number;
  storeId: number;
  startDate?: string | null;
  endDate?: string | null;
  isPrimary?: boolean | null;
  status?: string | null;
  [key: string]: unknown;
}

export interface StoreManagerResponse {
  storeManagerId: number;
  storeId: number;
  employeeId: number;
  startDate?: string | null;
  endDate?: string | null;
  [key: string]: unknown;
}

export interface StoreRequest {
  storeCode: string;
  storeName: string;
  logoId?: number;
  address?: string;
  phone?: string;
  status: string;
  note?: string;
}

export interface AttachmentResponse {
  attachmentId: number;
  fileName?: string;
  filePath?: string;
  fileType?: string;
  fileSize?: number;
  url?: string;
}

export interface SchedulePeriodResponse {
  id?: number;
  schedulePeriodId?: number;
  storeId?: number | null;
  periodName?: string | null;
  periodType?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  registrationOpenAt?: string | null;
  registrationCloseAt?: string | null;
  status?: string | null;
  [key: string]: unknown;
}

export interface ShiftResponse {
  id?: number;
  shiftId?: number;
  storeId?: number | null;
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

export interface EmployeeRequest {
  userId: number;
  employeeCode: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  email?: string;
  phone?: string;
  address?: string;
  hireDate?: string;
  status: string;
  note?: string;
}

export const managerApi = {
  getEmployees: (status?: string) =>
    requestManagerApi<EmployeeResponse[]>(
      status
        ? `/api/v1/employees?status=${encodeURIComponent(status)}`
        : "/api/v1/employees"
    ),
  getStores: (status?: string) =>
    requestManagerApi<StoreResponse[]>(
      status
        ? `/api/v1/stores?status=${encodeURIComponent(status)}`
        : "/api/v1/stores"
    ),
  getEmployeeStores: (filters?: {
    storeId?: number;
    role?: "MANAGER" | "EMPLOYEE";
    status?: string;
    primary?: boolean;
  }) => {
    const params = new URLSearchParams();
    if (filters?.storeId !== undefined) params.set("storeId", String(filters.storeId));
    if (filters?.role) params.set("role", filters.role);
    if (filters?.status) params.set("status", filters.status);
    if (filters?.primary !== undefined) params.set("primary", String(filters.primary));
    const query = params.toString();
    return requestManagerApi<EmployeeStoreResponse[]>(
      `/api/v1/employee_store${query ? `?${query}` : ""}`
    );
  },
  createEmployeeStore: (body: Record<string, unknown>) =>
    requestManagerApi<EmployeeStoreResponse>("/api/v1/employee_store", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateEmployeeStore: (id: number, body: Record<string, unknown>) =>
    requestManagerApi<EmployeeStoreResponse>(`/api/v1/employee_store/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  deleteEmployeeStore: (id: number) =>
    requestManagerApi<void>(`/api/v1/employee_store/${id}`, { method: "DELETE" }),
  getStoreManagers: () =>
    requestManagerApi<StoreManagerResponse[]>("/api/v1/store_manager"),
  createStore: (body: StoreRequest) =>
    requestManagerApi<StoreResponse>("/api/v1/stores", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateStore: (id: number, body: StoreRequest) =>
    requestManagerApi<StoreResponse>(`/api/v1/stores/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  deleteStore: (id: number) =>
    requestManagerApi<void>(`/api/v1/stores/${id}`, { method: "DELETE" }),
  createEmployee: (body: EmployeeRequest) =>
    requestManagerApi<EmployeeResponse>("/api/v1/employees", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateEmployee: (id: number, body: EmployeeRequest) =>
    requestManagerApi<EmployeeResponse>(`/api/v1/employees/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  deleteEmployee: (id: number) =>
    requestManagerApi<void>(`/api/v1/employees/${id}`, { method: "DELETE" }),
  uploadAttachment: async (file: File): Promise<ApiResponse<AttachmentResponse>> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${API_BASE_URL}/api/v1/attachment/upload`, {
      method: "POST",
      headers: (() => {
        const headers = new Headers({ Accept: "application/json" });
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("bloan_access_token");
          if (token) headers.set("Authorization", `Bearer ${token}`);
        }
        return headers;
      })(),
      body: formData,
    });
    const text = await response.text();
    const json = text ? JSON.parse(text) : null;
    if (!response.ok) {
      throw new Error(json?.message || json?.error || text || "Không thể tải ảnh lên");
    }
    return {
      statusCode: response.status,
      error: json?.error ?? null,
      message: json?.message ?? "Upload thành công",
      data: (json && "data" in json ? json.data : json) as AttachmentResponse,
    };
  },
  getSchedulePeriods: (filters?: {
    q?: string;
    from?: string;
    to?: string;
    storeId?: number;
    status?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.q) params.set("q", filters.q);
    if (filters?.from) params.set("from", filters.from);
    if (filters?.to) params.set("to", filters.to);
    if (filters?.storeId !== undefined) params.set("storeId", String(filters.storeId));
    if (filters?.status) params.set("status", filters.status);
    const query = params.toString();
    return requestManagerApi<SchedulePeriodResponse[]>(
      `/api/v1/schedule_period${query ? `?${query}` : ""}`,
    );
  },
  createSchedulePeriod: (body: Record<string, unknown>) =>
    requestManagerApi<SchedulePeriodResponse>("/api/v1/schedule_period", { method: "POST", body: JSON.stringify(body) }),
  updateSchedulePeriod: (id: number, body: Record<string, unknown>) =>
    requestManagerApi<SchedulePeriodResponse>(`/api/v1/schedule_period/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteSchedulePeriod: (id: number) =>
    requestManagerApi<void>(`/api/v1/schedule_period/${id}`, { method: "DELETE" }),
  getShifts: () => requestManagerApi<ShiftResponse[]>("/api/v1/shift"),
  createShift: (body: Record<string, unknown>) =>
    requestManagerApi<ShiftResponse>("/api/v1/shift", { method: "POST", body: JSON.stringify(body) }),
  updateShift: (id: number, body: Record<string, unknown>) =>
    requestManagerApi<ShiftResponse>(`/api/v1/shift/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteShift: (id: number) =>
    requestManagerApi<void>(`/api/v1/shift/${id}`, { method: "DELETE" }),
  getShiftsByDate: (filters?: {
    q?: string;
    from?: string;
    to?: string;
    storeId?: number;
    status?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.q) params.set("q", filters.q);
    if (filters?.from) params.set("from", filters.from);
    if (filters?.to) params.set("to", filters.to);
    if (filters?.storeId) params.set("storeId", String(filters.storeId));
    if (filters?.status) params.set("status", filters.status);
    const query = params.toString();
    return requestManagerApi<ShiftByDateResponse[]>(
      `/api/v1/shift_by_date${query ? `?${query}` : ""}`,
    );
  },
  createShiftByDate: (body: Record<string, unknown>) =>
    requestManagerApi<ShiftByDateResponse>("/api/v1/shift_by_date", { method: "POST", body: JSON.stringify(body) }),
  updateShiftByDate: (id: number, body: Record<string, unknown>) =>
    requestManagerApi<ShiftByDateResponse>(`/api/v1/shift_by_date/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteShiftByDate: (id: number) =>
    requestManagerApi<void>(`/api/v1/shift_by_date/${id}`, { method: "DELETE" }),
  getShiftAssignments: () =>
    requestManagerApi<ShiftAssignmentResponse[]>("/api/v1/shift_assignment"),
  createShiftAssignment: (body: Record<string, unknown>) =>
    requestManagerApi<ShiftAssignmentResponse>("/api/v1/shift_assignment", { method: "POST", body: JSON.stringify(body) }),
  updateShiftAssignment: (id: number, body: Record<string, unknown>) =>
    requestManagerApi<ShiftAssignmentResponse>(`/api/v1/shift_assignment/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteShiftAssignment: (id: number) =>
    requestManagerApi<void>(`/api/v1/shift_assignment/${id}`, { method: "DELETE" }),
  getEmergencyRequests: () =>
    requestManagerApi<EmergencyRequestResponse[]>("/api/v1/emergency_request"),
  createEmergencyRequest: (body: Record<string, unknown>) =>
    requestManagerApi<EmergencyRequestResponse>("/api/v1/emergency_request", { method: "POST", body: JSON.stringify(body) }),
  updateEmergencyRequest: (id: number, body: Record<string, unknown>) =>
    requestManagerApi<EmergencyRequestResponse>(`/api/v1/emergency_request/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  deleteEmergencyRequest: (id: number) =>
    requestManagerApi<void>(`/api/v1/emergency_request/${id}`, { method: "DELETE" }),
  getAttendances: (employeeId?: number) =>
    requestManagerApi<AttendanceResponse[]>(
      employeeId
        ? `/api/v1/attendance?employeeId=${employeeId}`
        : "/api/v1/attendance"
    ),
  checkIn: (body: {
    employeeId: number;
    latitude?: number;
    longitude?: number;
  }) =>
    requestManagerApi<AttendanceResponse>("/api/v1/attendance/check-in", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  createAttendance: (body: Record<string, unknown>) =>
    requestManagerApi<AttendanceResponse>("/api/v1/attendance", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateAttendance: (id: number, body: Record<string, unknown>) =>
    requestManagerApi<AttendanceResponse>(`/api/v1/attendance/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  deleteAttendance: (id: number) =>
    requestManagerApi<void>(`/api/v1/attendance/${id}`, { method: "DELETE" }),
  getRules: () => requestManagerApi<RuleResponse[]>("/api/v1/rule"),
  createRule: (body: Record<string, unknown>) =>
    requestManagerApi<RuleResponse>("/api/v1/rule", { method: "POST", body: JSON.stringify(body) }),
  updateRule: (id: number, body: Record<string, unknown>) =>
    requestManagerApi<RuleResponse>(`/api/v1/rule/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteRule: (id: number) =>
    requestManagerApi<void>(`/api/v1/rule/${id}`, { method: "DELETE" }),
  getViolations: () =>
    requestManagerApi<ViolationResponse[]>("/api/v1/violation"),
  createViolation: (body: Record<string, unknown>) =>
    requestManagerApi<ViolationResponse>("/api/v1/violation", { method: "POST", body: JSON.stringify(body) }),
  updateViolation: (id: number, body: Record<string, unknown>) =>
    requestManagerApi<ViolationResponse>(`/api/v1/violation/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteViolation: (id: number) =>
    requestManagerApi<void>(`/api/v1/violation/${id}`, { method: "DELETE" }),
  getDisciplinaryRecords: () =>
    requestManagerApi<DisciplinaryRecordResponse[]>("/api/v1/disciplinary_record"),
  createDisciplinaryRecord: (body: Record<string, unknown>) =>
    requestManagerApi<DisciplinaryRecordResponse>("/api/v1/disciplinary_record", { method: "POST", body: JSON.stringify(body) }),
  updateDisciplinaryRecord: (id: number, body: Record<string, unknown>) =>
    requestManagerApi<DisciplinaryRecordResponse>(`/api/v1/disciplinary_record/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteDisciplinaryRecord: (id: number) =>
    requestManagerApi<void>(`/api/v1/disciplinary_record/${id}`, { method: "DELETE" }),
  getBonusRecords: () =>
    requestManagerApi<BonusRecordResponse[]>("/api/v1/bonus_record"),
  createBonusRecord: (body: Record<string, unknown>) =>
    requestManagerApi<BonusRecordResponse>("/api/v1/bonus_record", { method: "POST", body: JSON.stringify(body) }),
  updateBonusRecord: (id: number, body: Record<string, unknown>) =>
    requestManagerApi<BonusRecordResponse>(`/api/v1/bonus_record/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteBonusRecord: (id: number) =>
    requestManagerApi<void>(`/api/v1/bonus_record/${id}`, { method: "DELETE" }),
  getBonusDetails: () =>
    requestManagerApi<BonusDetailResponse[]>("/api/v1/bonus_detail"),
  createBonusDetail: (body: Record<string, unknown>) =>
    requestManagerApi<BonusDetailResponse>("/api/v1/bonus_detail", { method: "POST", body: JSON.stringify(body) }),
  updateBonusDetail: (id: number, body: Record<string, unknown>) =>
    requestManagerApi<BonusDetailResponse>(`/api/v1/bonus_detail/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteBonusDetail: (id: number) =>
    requestManagerApi<void>(`/api/v1/bonus_detail/${id}`, { method: "DELETE" }),
};
