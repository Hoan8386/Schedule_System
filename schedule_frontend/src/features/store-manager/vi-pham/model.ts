export interface ViolationItem {
  id: string;
  staffName: string;
  staffCode: string;
  title: string;
  shiftDetail: string;
  category: string;
  time: string;
  status: "PENDING_VERIFY" | "PROCESSING" | "COMPLETED";
}

/** Bản ghi vi phạm từ backend -> dòng hiển thị (fallback dùng khi vừa tạo mới). */
export const toViolation = (item: Record<string, unknown>, fallback: Partial<ViolationItem> = {}): ViolationItem => ({
  id: String(item.violationId ?? item.id ?? ""),
  staffName: String(item.employeeName ?? fallback.staffName ?? `Nhân viên #${item.employeeId ?? "-"}`),
  staffCode: String(item.employeeCode ?? fallback.staffCode ?? ""),
  title: String(item.description ?? fallback.title ?? "Vi phạm"),
  shiftDetail: String(item.shiftDetail ?? fallback.shiftDetail ?? ""),
  category: String(item.category ?? fallback.category ?? "Khác"),
  time: String(item.violationTime ?? fallback.time ?? ""),
  status: fallback.status ?? (item.status === "COMPLETED" ? "COMPLETED" : item.status === "PROCESSING" ? "PROCESSING" : "PENDING_VERIFY"),
});

export const VIOLATION_STATUS: Record<ViolationItem["status"], { label: string; className: string; filter: string }> = {
  PENDING_VERIFY: { label: "Chờ xác minh", className: "border border-brand-200 bg-brand-50 text-brand-700", filter: "pending" },
  PROCESSING: { label: "Đang xử lý", className: "border border-blue-200 bg-blue-50 text-blue-700", filter: "processing" },
  COMPLETED: { label: "Hoàn tất", className: "bg-slate-100 text-slate-600", filter: "completed" },
};
