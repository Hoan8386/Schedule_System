import { managerApi, requestManagerApi } from "@/lib/managerApi";

export const employeeApi = {
  getProfile: () => managerApi.getEmployees(),
  getShiftsByDate: managerApi.getShiftsByDate,
  getAssignments: managerApi.getShiftAssignments,
  createAssignment: managerApi.createShiftAssignment,
  getEmergencyRequests: managerApi.getEmergencyRequests,
  createEmergencyRequest: managerApi.createEmergencyRequest,
  getFeedback: () => requestManagerApi<Record<string, unknown>[]>("/api/v1/feedback"),
  createFeedback: (body: Record<string, unknown>) =>
    requestManagerApi<Record<string, unknown>>("/api/v1/feedback", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getAttendance: managerApi.getAttendances,
  getTestAssignments: managerApi.getTestAssignments,
  getTestResults: managerApi.getTestResults,
  getTests: managerApi.getTests,
  getTestQuestions: managerApi.getTestQuestions,
  getTestOptions: managerApi.getTestOptions,
  createTestResult: managerApi.createTestResult,
};

export default employeeApi;