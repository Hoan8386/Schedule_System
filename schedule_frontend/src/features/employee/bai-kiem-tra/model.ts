import type { TestAssignmentResponse, TestResponse, TestResultResponse } from "@/lib/api";

export interface TestItem {
  id: string;
  title: string;
  code: string;
  type: string;
  questions: number;
  duration: number;
  dueDate: string;
  isUrgent?: boolean;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  score?: number;
}

/** Ghép bài được giao + đề + kết quả thành danh sách hiển thị cho nhân viên. */
export function buildTestItems(assignments: TestAssignmentResponse[], tests: TestResponse[], results: TestResultResponse[]): TestItem[] {
  const resultByAssignment = new Map(results.map((result) => [result.testAssignmentId, result]));
  const testById = new Map(tests.map((test) => [test.testId ?? test.id, test]));
  return assignments.map((assignment) => {
    const test = testById.get(assignment.testId);
    const result = resultByAssignment.get(assignment.id ?? assignment.testAssignmentId ?? -1);
    return {
      id: String(assignment.id ?? assignment.testAssignmentId),
      title: test?.testName ?? `Bài kiểm tra #${assignment.testId}`,
      code: test?.testCode ?? "",
      type: test?.description ?? "Đào tạo",
      questions: 0,
      duration: test?.durationMinutes ?? 0,
      dueDate: assignment.dueAt ?? "Chưa có hạn",
      status: result ? "COMPLETED" : assignment.status === "IN_PROGRESS" ? "IN_PROGRESS" : "NOT_STARTED",
      score: result?.score,
    };
  });
}

export const TEST_STATUS: Record<TestItem["status"], { label: string; className: string }> = {
  NOT_STARTED: { label: "Chưa làm", className: "border border-brand-200 bg-brand-50 text-brand-700" },
  IN_PROGRESS: { label: "Đang làm", className: "border border-blue-200 bg-blue-50 text-blue-700" },
  COMPLETED: { label: "Hoàn thành", className: "bg-slate-100 text-slate-600" },
};

/** Câu hỏi mẫu trong khung làm bài */
export const SAMPLE_QUESTION = {
  text: "Sau khi sử dụng xong dụng cụ chế biến đồ ăn vặt tại quầy, quy trình bảo quản đúng theo tiêu chuẩn BLOAN là gì?",
  options: [
    { id: "A", text: "Để dụng cụ ướt trên khay cho ráo tự nhiên." },
    { id: "B", text: "Làm khô và cất ở nơi sạch sẽ, khô ráo theo đúng hướng dẫn phân loại." },
    { id: "C", text: "Cất chung với dụng cụ chưa vệ sinh để tiện ca sau." },
    { id: "D", text: "Chỉ cần bọc vào túi kín." },
  ],
};
