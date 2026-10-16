/** Type – Bài kiểm tra */

export interface TestResponse {
  testId?: number;
  id?: number;
  testCode: string;
  testName: string;
  description?: string;
  targetRoleId?: number;
  durationMinutes?: number;
  passingScore?: number;
  status: string;
  createdBy?: number;
  createdAt?: string;
  [key: string]: unknown;
}

export interface TestRequest {
  testCode: string;
  testName: string;
  description?: string;
  targetRoleId?: number;
  durationMinutes?: number;
  passingScore?: number;
  status: string;
  createdBy?: number;
}

export interface TestQuestionResponse {
  questionId?: number;
  id?: number;
  testId: number;
  questionText: string;
  questionType: string;
  score?: number;
  displayOrder?: number;
  [key: string]: unknown;
}

export interface TestOptionResponse {
  optionId?: number;
  id?: number;
  questionId: number;
  optionText: string;
  isCorrect?: boolean;
  displayOrder?: number;
  [key: string]: unknown;
}

export interface TestAssignmentResponse {
  testAssignmentId?: number;
  id?: number;
  testId: number;
  employeeId: number;
  assignedBy?: number;
  assignedAt?: string;
  dueAt?: string;
  status: string;
  [key: string]: unknown;
}

export interface TestResultResponse {
  testResultId?: number;
  id?: number;
  testAssignmentId: number;
  score?: number;
  passed?: boolean;
  startedAt?: string;
  submittedAt?: string;
  gradedBy?: number;
  gradedAt?: string;
  [key: string]: unknown;
}
