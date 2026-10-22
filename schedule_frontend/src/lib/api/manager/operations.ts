import { crud, http, withQuery, type Body } from "../http";
import type {
  AttendanceResponse,
  BonusDetailResponse,
  BonusRecordResponse,
  DisciplinaryRecordResponse,
  FeedbackColleague,
  FeedbackCreateBody,
  FeedbackItem,
  FeedbackReplyBody,
  RuleResponse,
  ViolationResponse,
} from "../types/operations.types";
import type { AttendancePage, AttendancePageParams } from "../types/page.types";

const attendance = crud<AttendanceResponse>("/api/v1/attendance");
const rules = crud<RuleResponse>("/api/v1/rule");
const violations = crud<ViolationResponse>("/api/v1/violation");
const disciplinary = crud<DisciplinaryRecordResponse>("/api/v1/disciplinary_record");
const bonusRecords = crud<BonusRecordResponse>("/api/v1/bonus_record");
const bonusDetails = crud<BonusDetailResponse>("/api/v1/bonus_detail");
const todos = crud<Body>("/api/v1/todo");

/** Chấm công, nội quy, vi phạm, kỷ luật, thưởng, feedback, todo. */
export const operationsApi = {
  getAttendances: (employeeId?: number) => http.get<AttendanceResponse[]>(withQuery("/api/v1/attendance", { employeeId })),
  /** Trang chấm công: mới nhất trước, phân trang + lọc + tìm kiếm tại backend, kèm số liệu thống kê */
  getAttendancePage: (params: AttendancePageParams, signal?: AbortSignal) =>
    http.get<AttendancePage>(withQuery("/api/v1/attendance/page", { ...params }), { signal }),
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

  /** Phản hồi trong phạm vi người dùng hiện tại (backend lọc theo vai trò) */
  getFeedback: () => http.get<FeedbackItem[]>("/api/v1/feedback"),
  /** Chi tiết phản hồi, kèm ảnh đính kèm dạng data URL */
  getFeedbackDetail: (id: number) => http.get<FeedbackItem>(`/api/v1/feedback/${id}`),
  createFeedback: (body: FeedbackCreateBody) => http.post<FeedbackItem>("/api/v1/feedback", body),
  /** Chuyển trạng thái phản hồi (kèm ghi chú trả lời tùy chọn) */
  replyFeedback: (id: number, body: FeedbackReplyBody) => http.put<FeedbackItem>(`/api/v1/feedback/${id}`, body),
  /** Đồng nghiệp cùng cửa hàng – cho phản hồi loại Đồng nghiệp */
  getFeedbackColleagues: () => http.get<FeedbackColleague[]>("/api/v1/feedback/colleagues"),

  getTodos: todos.list,
  createTodo: todos.create,
  updateTodo: todos.update,
};
