import { crud, http, withQuery, type Body } from "../http";
import type {
  AttendanceResponse,
  BonusDetailResponse,
  BonusRecordResponse,
  DisciplinaryRecordResponse,
  RuleResponse,
  ViolationResponse,
} from "../types/operations.types";

const attendance = crud<AttendanceResponse>("/api/v1/attendance");
const rules = crud<RuleResponse>("/api/v1/rule");
const violations = crud<ViolationResponse>("/api/v1/violation");
const disciplinary = crud<DisciplinaryRecordResponse>("/api/v1/disciplinary_record");
const bonusRecords = crud<BonusRecordResponse>("/api/v1/bonus_record");
const bonusDetails = crud<BonusDetailResponse>("/api/v1/bonus_detail");
const feedback = crud<Body>("/api/v1/feedback");
const todos = crud<Body>("/api/v1/todo");

/** Chấm công, nội quy, vi phạm, kỷ luật, thưởng, feedback, todo. */
export const operationsApi = {
  getAttendances: (employeeId?: number) => http.get<AttendanceResponse[]>(withQuery("/api/v1/attendance", { employeeId })),
  checkIn: (body: { employeeId: number; latitude?: number; longitude?: number }) =>
    http.post<AttendanceResponse>("/api/v1/attendance/check-in", body),
  createAttendance: attendance.create,
  updateAttendance: attendance.update,
  deleteAttendance: attendance.remove,

  getRules: rules.list,
  createRule: rules.create,
  updateRule: rules.update,
  deleteRule: rules.remove,

  getViolations: violations.list,
  createViolation: violations.create,
  updateViolation: violations.update,
  deleteViolation: violations.remove,

  getDisciplinaryRecords: disciplinary.list,
  createDisciplinaryRecord: disciplinary.create,
  updateDisciplinaryRecord: disciplinary.update,
  deleteDisciplinaryRecord: disciplinary.remove,

  getBonusRecords: bonusRecords.list,
  createBonusRecord: bonusRecords.create,
  updateBonusRecord: bonusRecords.update,
  deleteBonusRecord: bonusRecords.remove,

  getBonusDetails: bonusDetails.list,
  createBonusDetail: bonusDetails.create,
  updateBonusDetail: bonusDetails.update,
  deleteBonusDetail: bonusDetails.remove,

  getFeedback: feedback.list,
  createFeedback: feedback.create,
  updateFeedback: feedback.update,

  getTodos: todos.list,
  createTodo: todos.create,
  updateTodo: todos.update,
};
