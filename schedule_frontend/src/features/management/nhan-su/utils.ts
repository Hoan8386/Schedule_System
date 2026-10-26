import { API_BASE_URL, managerApi, type AttachmentResponse, type EmployeeRequest, type EmployeeResponse, type EmployeeStoreResponse } from "@/lib/api";

export const NOT_SET = "Chưa cập nhật";

export const value = (input: unknown, fallback = NOT_SET) =>
  input === null || input === undefined || String(input).trim() === "" ? fallback : String(input);

export const date = (input: string | null | undefined) => (input ? new Date(input).toLocaleDateString("vi-VN") : NOT_SET);

export const dateTime = (input: string | null | undefined) => (input ? new Date(input).toLocaleString("vi-VN") : NOT_SET);

export const genderName = (gender: string | null | undefined) =>
  ({ MALE: "Nam", FEMALE: "Nữ", OTHER: "Khác" })[gender?.toUpperCase() ?? ""] ?? value(gender);

/** Giới tính chỉ có Nam / Nữ. */
export const GENDER_OPTIONS = [
  { value: "MALE", label: "Nam" },
  { value: "FEMALE", label: "Nữ" },
];

/** Trạng thái làm việc: mã ACTIVE / INACTIVE / RESIGNED chỉ dùng trong code, người dùng chỉ thấy nhãn. */
export const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Đang làm việc" },
  { value: "INACTIVE", label: "Tạm nghỉ" },
  { value: "RESIGNED", label: "Đã nghỉ việc" },
];

export const statusName = (status: string | null | undefined) =>
  STATUS_OPTIONS.find((option) => option.value === status?.toUpperCase())?.label.toUpperCase() ?? "CHƯA CẬP NHẬT";

export const isActive = (status: string | null | undefined) => status?.toUpperCase() === "ACTIVE";

/** Vị trí của nhân viên (quyền tài khoản đi theo vị trí). */
export const POSITION_OPTIONS = [
  { value: "EMPLOYEE", label: "Nhân viên" },
  { value: "STORE_MANAGER", label: "Trưởng cửa hàng" },
];

const POSITION_LABEL: Record<string, string> = {
  EMPLOYEE: "Nhân viên",
  STORE_MANAGER: "Trưởng cửa hàng",
  MANAGER: "Quản lý",
  ADMIN: "Quản trị viên",
};

export const positionName = (position: string | null | undefined) => POSITION_LABEL[position?.toUpperCase() ?? ""] ?? NOT_SET;

/** Ảnh: URL tuyệt đối, data URI, đường dẫn backend ("/api/...") hoặc id tệp đính kèm. */
export const resolveImageUrl = (imgOrId?: string | number | null) => {
  if (!imgOrId) return null;
  const str = String(imgOrId).trim();
  if (!str) return null;
  if (/^(https?:|data:|blob:)/.test(str)) return str;
  if (str.startsWith("/")) return `${API_BASE_URL}${str}`;
  if (/^\d+$/.test(str)) return managerApi.getAttachmentFileUrl(str);
  // Khóa lưu trữ nội bộ ("images/xxx.png") không mở trực tiếp được → hiện ảnh mặc định
  return null;
};

/**
 * Giá trị lưu vào hồ sơ cho ảnh vừa tải lên: URL công khai nếu có, ngược lại đường dẫn tải ảnh qua backend.
 * (Khi kho ảnh chưa cấu hình tên miền công khai, `url` chỉ là khóa nội bộ "images/xxx.png" – không hiển thị được.)
 */
export const attachmentUrl = (attachment: AttachmentResponse) => {
  if (attachment.url && /^https?:/.test(attachment.url)) return attachment.url;
  return attachment.attachmentId ? `/api/v1/attachment/file/${attachment.attachmentId}` : "";
};

export const toEmployeeForm = (employee?: EmployeeResponse | null): EmployeeRequest => ({
  userId: employee?.userId ?? undefined,
  employeeCode: employee?.employeeCode ?? "",
  fullName: employee?.fullName ?? "",
  avatar: (employee?.avatar as string) ?? "",
  idCardFrontId: employee?.idCardFrontId ?? null,
  idCardBackId: employee?.idCardBackId ?? null,
  signatureId: employee?.signatureId ?? null,
  dateOfBirth: employee?.dateOfBirth ?? "",
  // Dữ liệu cũ "OTHER" phải chọn lại Nam / Nữ
  gender: GENDER_OPTIONS.some((option) => option.value === employee?.gender?.toUpperCase()) ? employee!.gender!.toUpperCase() : "",
  email: employee?.email ?? "",
  phone: employee?.phone ?? "",
  address: employee?.address ?? "",
  hireDate: employee?.hireDate ?? "",
  status: employee?.status?.toUpperCase() ?? "ACTIVE",
  note: employee?.note ?? "",
  // Tạo mới: không chọn sẵn vị trí nào
  position: POSITION_OPTIONS.some((option) => option.value === employee?.position) ? (employee?.position as string) : "",
});

/** Phân bổ còn hiệu lực (đang làm tại cửa hàng). */
export const activeAssignmentsOf = (assignments: EmployeeStoreResponse[] | undefined) =>
  (assignments ?? []).filter((assignment) => !assignment.status || isActive(assignment.status));
