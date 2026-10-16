import { crud } from "../http";
import type {
  TestAssignmentResponse,
  TestOptionResponse,
  TestQuestionResponse,
  TestResponse,
  TestResultResponse,
} from "../types/test.types";

const tests = crud<TestResponse>("/api/v1/test");
const questions = crud<TestQuestionResponse>("/api/v1/test_question");
const options = crud<TestOptionResponse>("/api/v1/test_option");
const assignments = crud<TestAssignmentResponse>("/api/v1/test_assignment");
const results = crud<TestResultResponse>("/api/v1/test_result");

/** Bài kiểm tra: đề, câu hỏi, đáp án, giao bài và kết quả. */
export const testApi = {
  getTests: tests.list,
  getTestById: tests.get,
  createTest: tests.create,
  updateTest: tests.update,
  deleteTest: tests.remove,

  getTestQuestions: questions.list,
  getTestQuestionById: questions.get,
  createTestQuestion: questions.create,
  updateTestQuestion: questions.update,
  deleteTestQuestion: questions.remove,

  getTestOptions: options.list,
  createTestOption: options.create,
  updateTestOption: options.update,
  deleteTestOption: options.remove,

  getTestAssignments: assignments.list,
  createTestAssignment: assignments.create,
  updateTestAssignment: assignments.update,
  deleteTestAssignment: assignments.remove,

  getTestResults: results.list,
  createTestResult: results.create,
  updateTestResult: results.update,
  deleteTestResult: results.remove,
};
