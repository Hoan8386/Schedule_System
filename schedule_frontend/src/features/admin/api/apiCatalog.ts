import type { PermissionResponse, RolePermissionResponse, RoleResponse } from "@/lib/api";
import type { UserRoleCode } from "@/types/auth";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
export type MethodFilter = "ALL" | HttpMethod;
export const METHOD_FILTERS: MethodFilter[] = ["ALL", "GET", "POST", "PUT", "DELETE"];

export interface ApiEndpointItem {
  id: string;
  permissionId: number;
  method: HttpMethod;
  path: string;
  name: string;
  desc: string;
  module: string;
  controller: string;
  roles: UserRoleCode[];
  status?: string;
}

export const SUPPORTED_ROLES: UserRoleCode[] = ["ADMIN", "MANAGER", "STORE_MANAGER", "EMPLOYEE"];
export const isSupportedRole = (code: string): code is UserRoleCode => (SUPPORTED_ROLES as string[]).includes(code);

const MODULE_LABEL: Record<string, string> = {
  auth: "Xác thực & Phiên",
  user: "Tài khoản & Phân quyền",
  role: "Tài khoản & Phân quyền",
  permission: "Tài khoản & Phân quyền",
  user_role: "Tài khoản & Phân quyền",
  role_permission: "Tài khoản & Phân quyền",
  audit_log: "Cấu hình & Quản trị",
  organization_setting: "Cấu hình & Quản trị",
  system_config: "Cấu hình & Quản trị",
  stores: "Cửa hàng & Nhân sự",
  employees: "Cửa hàng & Nhân sự",
  schedule: "Lịch & Ca làm",
  shift: "Lịch & Ca làm",
  attendance: "Chấm công",
  payroll: "Lương & Thưởng",
  feedback: "Feedback & Đánh giá",
  notification: "Thông báo",
  test: "Kiểm tra & Đào tạo",
};

export const moduleFromPath = (path: string) => MODULE_LABEL[path.replace(/^\/api\/v1\//, "").split("/")[0]] || "API khác";

/** Danh mục endpoint lấy từ bảng permission + liên kết role_permission. */
export function endpointsFromPermissions(permissions: PermissionResponse[], roles: RoleResponse[], links: RolePermissionResponse[]): ApiEndpointItem[] {
  const roleById = new Map(roles.map((role) => [role.roleId, role.roleCode]));
  const rolesByPermission = new Map<number, UserRoleCode[]>();
  links.forEach(({ permissionId, roleId }) => {
    const code = roleById.get(roleId);
    if (!code || !isSupportedRole(code)) return;
    const existing = rolesByPermission.get(permissionId) ?? [];
    if (!existing.includes(code)) rolesByPermission.set(permissionId, [...existing, code]);
  });

  return permissions
    .filter((permission) => permission.apiPath && permission.method)
    .map((permission) => ({
      id: `permission_${permission.permissionId}`,
      permissionId: permission.permissionId,
      method: permission.method!.toUpperCase() as HttpMethod,
      path: permission.apiPath!,
      name: permission.permissionName,
      desc: permission.description || permission.permissionCode,
      module: moduleFromPath(permission.apiPath!),
      controller: "Backend permission",
      roles: rolesByPermission.get(permission.permissionId) ?? [],
    }));
}

/** Tìm kiếm không phân biệt hoa thường trên nhiều trường. */
export const matchesText = (term: string, ...fields: string[]) => {
  const needle = term.toLowerCase();
  return fields.some((field) => field.toLowerCase().includes(needle));
};

export interface RoleMeta {
  name: string;
  badge: string;
  bar: string;
  desc: string;
  scope: string;
}

export const ROLE_META: Record<UserRoleCode, RoleMeta> = {
  ADMIN: {
    name: "Quản trị viên (Root Admin)",
    badge: "bg-red-50 text-red-700 border-red-200",
    bar: "bg-red-500",
    desc: "Toàn quyền quản trị hệ thống, tài khoản, cấu hình tham số, bảo mật và toàn bộ API",
    scope: "Toàn bộ hệ thống BLOAN (Toàn quyền 100%)",
  },
  MANAGER: {
    name: "Quản lý chuỗi (Operation Manager)",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    bar: "bg-blue-500",
    desc: "Quản lý vận hành toàn chuỗi chi nhánh, nhân sự, chốt bảng lương, duyệt ca và giải trình",
    scope: "Toàn bộ chi nhánh & Cụm cửa hàng",
  },
  STORE_MANAGER: {
    name: "Trưởng cửa hàng (Store Manager)",
    badge: "bg-brand-50 text-brand-800 border-brand-200",
    bar: "bg-brand-500",
    desc: "Xếp ca, đối soát chấm công, duyệt đổi ca nhân viên, lập biên bản và đề xuất khen thưởng tại cửa hàng",
    scope: "Cửa hàng phụ trách",
  },
  EMPLOYEE: {
    name: "Nhân viên (Staff / Member)",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    bar: "bg-emerald-500",
    desc: "Xem lịch làm việc cá nhân, đăng ký ca mở, điểm danh FaceID, xem phiếu lương và nộp bài kiểm tra",
    scope: "Dữ liệu cá nhân & Ca làm việc của mình",
  },
};

const METHOD_BADGE: Record<string, string> = {
  GET: "bg-emerald-100 text-emerald-800 border-emerald-200",
  POST: "bg-blue-100 text-blue-800 border-blue-200",
  PUT: "bg-brand-100 text-brand-800 border-brand-200",
  DELETE: "bg-rose-100 text-rose-800 border-rose-200",
};
export const methodBadge = (method: string) => METHOD_BADGE[method] ?? "bg-slate-100 text-slate-800 border-slate-200";

const ACTION_TYPE: Record<HttpMethod, { label: string; color: string }> = {
  GET: { label: "Đọc dữ liệu (Read)", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  POST: { label: "Thêm mới (Create)", color: "text-blue-700 bg-blue-50 border-blue-200" },
  PUT: { label: "Cập nhật (Update)", color: "text-brand-700 bg-brand-50 border-brand-200" },
  DELETE: { label: "Xóa bỏ (Delete)", color: "text-rose-700 bg-rose-50 border-rose-200" },
};
export const actionTypeOf = (method: HttpMethod) => ACTION_TYPE[method] ?? ACTION_TYPE.DELETE;
