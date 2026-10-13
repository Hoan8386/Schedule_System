import { managerApi, requestManagerApi } from "@/lib/managerApi";

/**
 * Store-manager API surface.
 *
 * Authorization and store scoping are enforced by the backend. This module
 * only exposes the operations available to the store-manager workspace and
 * deliberately reuses the shared request implementation.
 */
export const storeManagerApi = {
  getEmployees: managerApi.getEmployees,
  getStores: managerApi.getStores,
  getEmployeeStores: managerApi.getEmployeeStores,

  getShiftAssignments: managerApi.getShiftAssignments,
  createShiftAssignment: managerApi.createShiftAssignment,
  updateShiftAssignment: managerApi.updateShiftAssignment,
  getShiftsByDate: managerApi.getShiftsByDate,
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

  getFeedback: () =>
    requestManagerApi<Record<string, unknown>[]>("/api/v1/feedback"),
  createFeedback: (body: Record<string, unknown>) =>
    requestManagerApi<Record<string, unknown>>("/api/v1/feedback", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateFeedback: (id: number, body: Record<string, unknown>) =>
    requestManagerApi<Record<string, unknown>>(`/api/v1/feedback/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  getTodos: () =>
    requestManagerApi<Record<string, unknown>[]>("/api/v1/todo"),
  createTodo: (body: Record<string, unknown>) =>
    requestManagerApi<Record<string, unknown>>("/api/v1/todo", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateTodo: (id: number, body: Record<string, unknown>) =>
    requestManagerApi<Record<string, unknown>>(`/api/v1/todo/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
};
