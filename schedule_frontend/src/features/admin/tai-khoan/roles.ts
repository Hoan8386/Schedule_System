import type { UserRoleCode } from "@/types/auth";

export interface AccountItem {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  roleId: number;
  roleCode: UserRoleCode;
  roleName: string;
  storeName: string;
  status: "ACTIVE" | "LOCKED";
  lastLogin: string;
}

export const ALL_SCOPE = "Toàn hệ thống BLOAN";
export const PHONE_NOT_SET = "Chưa cập nhật";

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Quản trị viên",
  MANAGER: "Quản lý",
  STORE_MANAGER: "Quản lý chi nhánh",
  EMPLOYEE: "Nhân viên",
};

export const roleLabel = (code: string) => ROLE_LABEL[code] ?? (code || "Nhân viên");

const ROLE_BADGE: Record<string, string> = {
  ADMIN: "bg-rose-100 text-rose-800 border-rose-300",
  MANAGER: "bg-blue-100 text-blue-800 border-blue-300",
  STORE_MANAGER: "bg-brand-100 text-brand-900 border-brand-300",
};

export const roleBadgeClass = (code: string) => ROLE_BADGE[code] ?? "bg-emerald-100 text-emerald-800 border-emerald-300";

/** Mô tả quyền theo roleId (1..4) */
export const ROLE_DESCRIPTION: Record<number, [string, string]> = {
  1: ["Quản trị viên", "Toàn quyền quản trị hệ thống, quản lý tài khoản, phân quyền, cấu hình thông số và truy cập toàn bộ API."],
  2: ["Quản lý", "Quản lý vận hành toàn chuỗi chi nhánh, xem danh sách nhân sự, chốt bảng lương và duyệt đề xuất ca làm."],
  3: ["Quản lý chi nhánh", "Xếp ca làm việc, đối soát chấm công, duyệt đổi ca nhân viên và lập biên bản trong phạm vi chi nhánh phụ trách."],
  4: ["Nhân viên", "Nhân viên phục vụ/pha chế; chỉ xem lịch làm việc cá nhân, đăng ký ca mở, điểm danh FaceID và xem phiếu lương."],
};

/** Vai trò dự phòng khi API vai trò không trả dữ liệu */
export const FALLBACK_ROLES = [1, 2, 3, 4].map((roleId) => ({ roleId, roleCode: ["ADMIN", "MANAGER", "STORE_MANAGER", "EMPLOYEE"][roleId - 1] }));

/** Chi nhánh dự phòng khi API cửa hàng không trả dữ liệu */
export const FALLBACK_STORES = ["BLOAN · Chi nhánh trung tâm", "BLOAN · Lê Lợi (Q1)", "BLOAN · Tú Xương (Q3)", "BLOAN · Giga Mall (Thủ Đức)"];
