import type { EmergencyRequestResponse } from "@/lib/api";

export type RequestType = "REGISTER" | "SWAP" | "CANCEL";
export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface RequestItem {
  id: string;
  type: RequestType;
  staffName: string;
  staffCode: string;
  shiftDetail: string;
  reason: string;
  submitTime: string;
  status: RequestStatus;
}

export const toRequest = (item: EmergencyRequestResponse): RequestItem => ({
  id: String(item.emergencyRequestId ?? item.id ?? ""),
  type: item.requestType === "CHANGE" ? "SWAP" : item.requestType === "CANCEL" ? "CANCEL" : "REGISTER",
  staffName: String(item.employeeName ?? `Nhân viên #${item.employeeId ?? "-"}`),
  staffCode: String(item.employeeCode ?? ""),
  shiftDetail: String(item.shiftDetail ?? "Chưa có thông tin ca"),
  reason: String(item.reason ?? ""),
  submitTime: String(item.requestedAt ?? ""),
  status: item.status === "APPROVED" ? "APPROVED" : item.status === "REJECTED" ? "REJECTED" : "PENDING",
});

/** Loại yêu cầu ở giao diện -> giá trị backend */
export const typeToApi = (type: RequestType) => (type === "SWAP" ? "CHANGE" : type);

export const TYPE_LABEL: Record<RequestType, string> = { REGISTER: "Đăng ký", SWAP: "Đổi ca", CANCEL: "Hủy ca" };

export const REQUEST_STATUS: Record<RequestStatus, { label: string; className: string; filter: string }> = {
  PENDING: { label: "Chờ duyệt", className: "border border-brand-200 bg-brand-50 text-brand-700", filter: "pending" },
  APPROVED: { label: "Đã duyệt", className: "border border-emerald-200 bg-emerald-50 text-emerald-700", filter: "approved" },
  REJECTED: { label: "Từ chối", className: "border border-red-200 bg-red-50 text-red-700", filter: "rejected" },
};
