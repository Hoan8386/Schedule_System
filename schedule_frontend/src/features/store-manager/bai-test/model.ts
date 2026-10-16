import type { TestResponse } from "@/lib/api";

export interface TestPlan {
  id: string;
  code: string;
  title: string;
  duration: string;
  status: "ASSIGNED" | "CLOSED" | "DRAFT";
  dueDate: string;
  questionCount: number;
  submittedCount: number;
  totalAssigned: number;
}

export const toTestPlan = (test: TestResponse): TestPlan => ({
  id: String(test.testId ?? test.id ?? ""),
  code: test.testCode,
  title: test.testName,
  duration: `${test.durationMinutes ?? 0} phút`,
  status: test.status === "CLOSED" ? "CLOSED" : test.status === "DRAFT" ? "DRAFT" : "ASSIGNED",
  dueDate: String(test.dueAt ?? test.dueDate ?? ""),
  questionCount: Number(test.questionCount ?? 0),
  submittedCount: Number(test.submittedCount ?? 0),
  totalAssigned: Number(test.totalAssigned ?? 0),
});

export const PLAN_STATUS: Record<TestPlan["status"], { label: string; className: string }> = {
  ASSIGNED: { label: "Đã giao", className: "border border-brand-200 bg-brand-50 text-brand-700" },
  CLOSED: { label: "Đóng", className: "bg-slate-100 text-slate-500" },
  DRAFT: { label: "Nháp", className: "bg-slate-100 text-slate-600" },
};

/** Mã bài test sinh từ tên: chữ in hoa, ngăn bằng "-", tối đa 30 ký tự. */
export const codeFromName = (name: string) =>
  name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .slice(0, 30);

/** Nhân viên cửa hàng Nguyễn Trãi (dữ liệu mẫu cho phần giao bài). */
export const STORE_STAFF = [
  { code: "NV024", name: "Nguyễn Minh Anh" },
  { code: "NV025", name: "Lê Quốc Bảo" },
  { code: "NV026", name: "Phạm Ngọc Linh" },
  { code: "NV027", name: "Đặng Gia Huy" },
  { code: "NV028", name: "Võ Thanh Thảo" },
  { code: "NV029", name: "Trần Minh Phúc" },
];

/** Đáp án mẫu của câu hỏi đang soạn. */
export const DRAFT_OPTIONS = [
  { key: "A", text: "Để dụng cụ ướt trên quầy." },
  { key: "B", text: "Làm khô và cất ở nơi sạch theo hướng dẫn." },
  { key: "C", text: "Cất chung với dụng cụ chưa vệ sinh." },
  { key: "D", text: "Chỉ cần để trong túi kín." },
];
