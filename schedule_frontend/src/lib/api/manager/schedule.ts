import { crud, http, withQuery } from "../http";
import type {
  EmergencyRequestResponse,
  SchedulePeriodDeletePreview,
  SchedulePeriodResponse,
  ScheduleRoundResponse,
  ScheduleSessionResponse,
  ShiftAssignmentResponse,
  ShiftByDateResponse,
  MyOpenShift,
  MyShiftGroups,
  ShiftGroupResponse,
  ShiftResponse,
  SpecialEventResponse,
} from "../types/schedule.types";

const periods = crud<SchedulePeriodResponse>("/api/v1/schedule_period");
const shifts = crud<ShiftResponse>("/api/v1/shift");
const shiftsByDate = crud<ShiftByDateResponse>("/api/v1/shift_by_date");
const assignments = crud<ShiftAssignmentResponse>("/api/v1/shift_assignment");
const rounds = crud<ScheduleRoundResponse>("/api/v1/schedule_round");
const sessions = crud<ScheduleSessionResponse>("/api/v1/schedule_session");
const groups = crud<ShiftGroupResponse>("/api/v1/shift_group");
const events = crud<SpecialEventResponse>("/api/v1/special_event");
const emergencies = crud<EmergencyRequestResponse>("/api/v1/emergency_request");

type RangeFilters = { q?: string; from?: string; to?: string; storeId?: number; status?: string };

/** Kỳ → đợt → phiên, ca mẫu, ca theo ngày, phân bổ, sự kiện và yêu cầu khẩn. */
export const scheduleApi = {
  getSchedulePeriods: (filters?: RangeFilters) => http.get<SchedulePeriodResponse[]>(withQuery("/api/v1/schedule_period", filters)),
  createSchedulePeriod: periods.create,
  updateSchedulePeriod: periods.update,
  deleteSchedulePeriod: periods.remove,
  getSchedulePeriodDeletePreview: (id: number) =>
    http.get<SchedulePeriodDeletePreview>(`/api/v1/schedule_period/${id}/delete-preview`),

  getShifts: (filters?: { storeId?: number; status?: string }) => http.get<ShiftResponse[]>(withQuery("/api/v1/shift", filters)),
  createShift: shifts.create,
  updateShift: shifts.update,
  deleteShift: shifts.remove,
  /** Lưu min / max của nhiều ca mẫu trong một giao dịch */
  updateShiftCapacities: (items: { id: number; minCapacity: number | null; maxCapacity: number | null }[]) =>
    http.put<ShiftResponse[]>("/api/v1/shift/capacity", items),

  getShiftsByDate: (filters?: RangeFilters) => http.get<ShiftByDateResponse[]>(withQuery("/api/v1/shift_by_date", filters)),
  createShiftByDate: shiftsByDate.create,
  updateShiftByDate: shiftsByDate.update,
  deleteShiftByDate: shiftsByDate.remove,

  getShiftAssignments: assignments.list,
  createShiftAssignment: assignments.create,
  updateShiftAssignment: assignments.update,
  deleteShiftAssignment: assignments.remove,
  /** Duyệt hàng loạt các đăng ký ca đang chờ duyệt */
  approveShiftAssignments: (ids: number[]) => http.patch<{ approved: number }>("/api/v1/shift_assignment/approve", { ids }, { notify: false }),

  getScheduleRounds: rounds.list,
  createScheduleRound: rounds.create,
  updateScheduleRound: rounds.update,
  deleteScheduleRound: rounds.remove,

  getScheduleSessions: sessions.list,
  createScheduleSession: sessions.create,
  updateScheduleSession: sessions.update,
  deleteScheduleSession: sessions.remove,

  getShiftGroups: groups.list,
  createShiftGroup: groups.create,
  updateShiftGroup: groups.update,
  deleteShiftGroup: groups.remove,
  /** Nhóm ca của người đang đăng nhập, ca mẫu và ca theo ngày đang mở (mặc định 60 ngày tới) */
  getMyShiftGroups: (filters?: { from?: string; to?: string }) =>
    http.get<MyShiftGroups>(withQuery("/api/v1/shift_group/me", filters)),
  /** Đăng ký ca trên thời khóa biểu (tự tạo ca theo ngày nếu chưa có) */
  registerMyShift: (shiftId: number, workDate: string) =>
    http.post<MyOpenShift>("/api/v1/shift_group/me/register", { shiftId: String(shiftId), workDate }),
  /** Hủy đăng ký ca của chính mình khi còn chờ duyệt (backend xóa bản ghi) */
  unregisterMyShift: (shiftId: number, workDate: string) =>
    http.delete<MyOpenShift>(withQuery("/api/v1/shift_group/me/register", { shiftId, workDate })),
  /** Lưu danh sách nhân viên của nhóm ca (thay toàn bộ) */
  saveShiftGroupEmployees: (id: number, employeeIds: number[]) =>
    http.put<{ employeeIds: number[] }>(`/api/v1/shift_group/${id}/employees`, { employeeIds }),

  getSpecialEvents: events.list,
  createSpecialEvent: events.create,
  updateSpecialEvent: events.update,
  deleteSpecialEvent: events.remove,

  getEmergencyRequests: emergencies.list,
  createEmergencyRequest: emergencies.create,
  updateEmergencyRequest: emergencies.update,
  deleteEmergencyRequest: emergencies.remove,
  /** Duyệt hàng loạt các yêu cầu khẩn đang chờ duyệt */
  approveEmergencyRequests: (ids: number[]) => http.patch<{ approved: number }>("/api/v1/emergency_request/approve", { ids }, { notify: false }),
};
