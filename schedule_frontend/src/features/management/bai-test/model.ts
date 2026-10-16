import type { EmployeeStoreResponse, StoreResponse, TestAssignmentResponse, TestQuestionResponse, TestOptionResponse, TestResultResponse } from "@/lib/api";

/** Id của bản ghi bất kể backend đặt tên khóa nào. */
export const idOf = (item: {
  id?: number;
  testId?: number;
  questionId?: number;
  optionId?: number;
  testAssignmentId?: number;
  testResultId?: number;
  storeId?: number;
  employeeId?: number;
}) => Number(item.id ?? item.testId ?? item.questionId ?? item.optionId ?? item.testAssignmentId ?? item.testResultId ?? item.storeId ?? item.employeeId ?? 0);

export const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Đang mở",
  DRAFT: "Bản nháp",
  INACTIVE: "Đã đóng",
  CLOSED: "Đã đóng",
};

export const statusBadge = (status: string) =>
  status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : status === "DRAFT" ? "bg-brand-50 text-brand-700" : "bg-slate-100 text-slate-500";

export type TestForm = {
  testCode: string;
  testName: string;
  description: string;
  durationMinutes: string;
  passingScore: string;
  status: string;
};

export const EMPTY_TEST_FORM: TestForm = {
  testCode: "",
  testName: "",
  description: "",
  durationMinutes: "15",
  passingScore: "70",
  status: "DRAFT",
};

export type OptionDraft = { id?: number; text: string; isCorrect: boolean };

export type QuestionDraft = { id?: number; text: string; score: string; options: OptionDraft[] };

/** Bản nháp câu hỏi để sửa (hoặc câu mới với 3 đáp án trống). */
export function toQuestionDraft(question: TestQuestionResponse | undefined, options: TestOptionResponse[]): QuestionDraft {
  const questionId = question ? idOf(question) : undefined;
  const existing = questionId ? options.filter((option) => option.questionId === questionId) : [];
  return {
    id: questionId,
    text: question?.questionText ?? "",
    score: String(question?.score ?? 1),
    options: existing.length
      ? existing.map((option) => ({ id: idOf(option), text: option.optionText, isCorrect: Boolean(option.isCorrect) }))
      : [
          { text: "", isCorrect: true },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
  };
}

export type StoreSummary = {
  storeId: number;
  storeName: string;
  assignedCount: number;
  completedCount: number;
  passedCount: number;
  testCount: number;
  employeeCount: number;
  avgScore: number | null;
};

const ACTIVE_LINK = ["ACTIVE", "CURRENT", "PRESENT"];

/** Tổng hợp giao bài / hoàn thành / đạt / điểm TB theo cửa hàng của nhân viên. */
export function buildStoreSummaries(
  stores: StoreResponse[],
  employeeStores: EmployeeStoreResponse[],
  assignments: TestAssignmentResponse[],
  results: TestResultResponse[]
): StoreSummary[] {
  const storeOfEmployee = new Map<number, number>();
  employeeStores.forEach(({ employeeId, storeId, status }) => {
    if (employeeId && storeId && ACTIVE_LINK.includes(status?.toUpperCase() ?? "ACTIVE")) storeOfEmployee.set(employeeId, storeId);
  });

  const employeesByStore = new Map<number, Set<number>>();
  storeOfEmployee.forEach((storeId, employeeId) => employeesByStore.set(storeId, (employeesByStore.get(storeId) ?? new Set()).add(employeeId)));

  const storeName = (storeId: number) => stores.find((store) => idOf(store) === storeId)?.storeName ?? `Cửa hàng #${storeId}`;
  const newSummary = (storeId: number): StoreSummary => ({
    storeId,
    storeName: storeName(storeId),
    assignedCount: 0,
    completedCount: 0,
    passedCount: 0,
    testCount: 0,
    employeeCount: employeesByStore.get(storeId)?.size ?? 0,
    avgScore: null,
  });

  const summaries = new Map<number, StoreSummary>();
  stores.forEach((store) => {
    const storeId = idOf(store);
    if (storeId) summaries.set(storeId, newSummary(storeId));
  });

  const resultKey = (result: TestResultResponse) => Number(result.testAssignmentId ?? result.id ?? 0);
  const testsByStore = new Map<number, Set<number>>();

  assignments.forEach((assignment) => {
    const assignmentId = Number(assignment.testAssignmentId ?? assignment.id ?? 0);
    const storeId = assignment.employeeId ? storeOfEmployee.get(assignment.employeeId) : undefined;
    if (!assignmentId || !storeId) return;

    const summary = summaries.get(storeId) ?? newSummary(storeId);
    summary.assignedCount += 1;
    const tests = (testsByStore.get(storeId) ?? new Set<number>()).add(assignment.testId);
    testsByStore.set(storeId, tests);
    summary.testCount = tests.size;
    summaries.set(storeId, summary);

    const matching = results.filter((result) => resultKey(result) === assignmentId);
    if (!matching.length) return;
    summary.completedCount += 1;
    if (matching[0].passed) summary.passedCount += 1;
    const scores = matching.map((result) => Number(result.score ?? 0)).filter(Number.isFinite);
    if (scores.length) {
      const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      const previous = summary.avgScore ?? 0;
      // Trung bình cộng dồn theo số bài đã hoàn thành
      summary.avgScore = (previous * (summary.completedCount - 1) + avg) / summary.completedCount;
    }
  });

  return Array.from(summaries.values()).sort((a, b) => b.assignedCount - a.assignedCount);
}
