import { managerApi } from "./manager";

/** Các thao tác dành cho không gian nhân viên (backend tự giới hạn theo nhân viên đăng nhập). */
export const employeeApi = {
  getProfile: () => managerApi.getEmployees(),
  getShiftsByDate: managerApi.getShiftsByDate,
  getAssignments: managerApi.getShiftAssignments,
  createAssignment: managerApi.createShiftAssignment,
  getEmergencyRequests: managerApi.getEmergencyRequests,
  createEmergencyRequest: managerApi.createEmergencyRequest,
  getFeedback: managerApi.getFeedback,
  createFeedback: managerApi.createFeedback,
  getAttendance: managerApi.getAttendances,
  getTestAssignments: managerApi.getTestAssignments,
  getTestResults: managerApi.getTestResults,
  getTests: managerApi.getTests,
  getTestQuestions: managerApi.getTestQuestions,
  getTestOptions: managerApi.getTestOptions,
  createTestResult: managerApi.createTestResult,
};
