import { crud, http, withQuery } from "../http";
import type {
  EmergencyRequestResponse,
  SchedulePeriodDeletePreview,
  SchedulePeriodResponse,
  ScheduleRoundResponse,
  ScheduleSessionResponse,
  ShiftAssignmentResponse,
  ShiftByDateResponse,
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

  getShiftsByDate: (filters?: RangeFilters) => http.get<ShiftByDateResponse[]>(withQuery("/api/v1/shift_by_date", filters)),
  createShiftByDate: shiftsByDate.create,
  updateShiftByDate: shiftsByDate.update,
  deleteShiftByDate: shiftsByDate.remove,

  getShiftAssignments: assignments.list,
  createShiftAssignment: assignments.create,
  updateShiftAssignment: assignments.update,
  deleteShiftAssignment: assignments.remove,

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

  getSpecialEvents: events.list,
  createSpecialEvent: events.create,
  updateSpecialEvent: events.update,
  deleteSpecialEvent: events.remove,

  getEmergencyRequests: emergencies.list,
  createEmergencyRequest: emergencies.create,
  updateEmergencyRequest: emergencies.update,
  deleteEmergencyRequest: emergencies.remove,
};
