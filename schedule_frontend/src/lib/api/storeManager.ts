import { managerApi } from "./manager";

/**
 * Các thao tác dành cho không gian trưởng cửa hàng.
 * Phân quyền và phạm vi cửa hàng do backend kiểm soát.
 */
export const storeManagerApi = {
  getEmployees: managerApi.getEmployees,
  getStores: managerApi.getStores,
  getEmployeeStores: managerApi.getEmployeeStores,

  getShiftAssignments: managerApi.getShiftAssignments,
  createShiftAssignment: managerApi.createShiftAssignment,
  updateShiftAssignment: managerApi.updateShiftAssignment,
  getShiftsByDate: managerApi.getShiftsByDate,
  /** Nhóm ca / kỳ đăng ký / ca theo ngày của chính trưởng cửa hàng */
  getMyShiftGroups: managerApi.getMyShiftGroups,
  registerMyShift: managerApi.registerMyShift,
  getShifts: managerApi.getShifts,
  getEmergencyRequests: managerApi.getEmergencyRequests,
  updateEmergencyRequest: managerApi.updateEmergencyRequest,

  getAttendances: managerApi.getAttendances,
  getViolations: managerApi.getViolations,
  createViolation: managerApi.createViolation,
  updateViolation: managerApi.updateViolation,
  getDisciplinaryRecords: managerApi.getDisciplinaryRecords,
  createDisciplinaryRecord: managerApi.createDisciplinaryRecord,
  updateDisciplinaryRecord: managerApi.updateDisciplinaryRecord,

  getTests: managerApi.getTests,
  createTest: managerApi.createTest,
  updateTest: managerApi.updateTest,
  getTestQuestions: managerApi.getTestQuestions,
  createTestQuestion: managerApi.createTestQuestion,
  updateTestQuestion: managerApi.updateTestQuestion,
  getTestAssignments: managerApi.getTestAssignments,
  createTestAssignment: managerApi.createTestAssignment,
  updateTestAssignment: managerApi.updateTestAssignment,
  getTestResults: managerApi.getTestResults,

  getFeedback: managerApi.getFeedback,
  createFeedback: managerApi.createFeedback,
  updateFeedback: managerApi.updateFeedback,

  getTodos: managerApi.getTodos,
  createTodo: managerApi.createTodo,
  updateTodo: managerApi.updateTodo,
};
