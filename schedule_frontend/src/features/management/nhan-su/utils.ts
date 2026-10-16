import { API_BASE_URL, managerApi, type AttachmentResponse, type EmployeeRequest, type EmployeeResponse, type EmployeeStoreResponse } from "@/lib/api";

export const NOT_SET = "Chưa cập nhật";

export const value = (input: unknown, fallback = NOT_SET) =>
  input === null || input === undefined || String(input).trim() === "" ? fallback : String(input);

export const date = (input: string | null | undefined) => (input ? new Date(input).toLocaleDateString("vi-VN") : NOT_SET);

export const dateTime = (input: string | null | undefined) => (input ? new Date(input).toLocaleString("vi-VN") : NOT_SET);

export const genderName = (gender: string | null | undefined) =>
  ({ MALE: "Nam", FEMALE: "Nữ", OTHER: "Khác" })[gender?.toUpperCase() ?? ""] ?? value(gender);

export const statusName = (status: string | null | undefined) =>
  ({ ACTIVE: "ĐANG LÀM VIỆC", INACTIVE: "TẠM NGƯNG", RESIGNED: "ĐÃ NGHỈ VIỆC" })[status?.toUpperCase() ?? ""] ??
  value(status, "CHƯA CẬP NHẬT");

export const isActive = (status: string | null | undefined) => status?.toUpperCase() === "ACTIVE";

/** Ảnh: URL tuyệt đối, data URI, đường dẫn tương đối hoặc id tệp đính kèm. */
export const resolveImageUrl = (imgOrId?: string | number | null) => {
  if (!imgOrId) return null;
  const str = String(imgOrId).trim();
  if (!str) return null;
  if (/^(https?:|data:)/.test(str)) return str;
  if (str.startsWith("/")) return `${API_BASE_URL}${str}`;
  return managerApi.getAttachmentFileUrl(str);
};

/** URL hiển thị của tệp vừa tải lên. */
export const attachmentUrl = (attachment: AttachmentResponse) =>
  attachment.url || (attachment.attachmentId ? managerApi.getAttachmentFileUrl(attachment.attachmentId) : "") || attachment.filePath || "";

export const emptyEmployeeForm: EmployeeRequest = {
  userId: undefined,
  employeeCode: "",
  fullName: "",
  avatar: "",
  idCardFrontId: null,
  idCardBackId: null,
  email: "",
  phone: "",
  address: "",
  hireDate: "",
  status: "ACTIVE",
  note: "",
};

export const toEmployeeForm = (employee?: EmployeeResponse | null): EmployeeRequest => ({
  userId: employee?.userId ?? undefined,
  employeeCode: employee?.employeeCode ?? "",
  fullName: employee?.fullName ?? "",
  avatar: (employee?.avatar as string) ?? "",
  idCardFrontId: employee?.idCardFrontId ?? null,
  idCardBackId: employee?.idCardBackId ?? null,
  dateOfBirth: employee?.dateOfBirth ?? "",
  gender: employee?.gender ?? "",
  email: employee?.email ?? "",
  phone: employee?.phone ?? "",
  address: employee?.address ?? "",
  hireDate: employee?.hireDate ?? "",
  status: employee?.status ?? "ACTIVE",
  note: employee?.note ?? "",
});

/** Phân bổ hiện tại: ưu tiên bản ghi ACTIVE, nếu không lấy bản đầu tiên. */
export const currentAssignmentOf = (assignments: EmployeeStoreResponse[] | undefined) =>
  assignments?.find((assignment) => isActive(assignment.status)) ?? assignments?.[0];

export interface EmployeeStoreForm {
  storeId: number;
  startDate: string;
  isPrimary: boolean;
  status: string;
}
