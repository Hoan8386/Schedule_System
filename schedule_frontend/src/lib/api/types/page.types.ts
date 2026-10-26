/** Type – Danh sách có phân trang (page bắt đầu từ 1, mặc định 10 bản ghi / trang). */

import type { AttendanceResponse } from "./operations.types";
import type { EmployeeResponse, EmployeeStoreResponse } from "./hr.types";

export interface PageMeta {
  page: number;
  pageSize: number;
  /** Tổng số trang */
  pages: number;
  /** Tổng số bản ghi khớp bộ lọc */
  total: number;
}

export interface PageResult<T, TSummary = undefined> {
  meta: PageMeta;
  result: T[];
  summary: TSummary;
}

export interface PageParams {
  page?: number;
  size?: number;
  /** Khóa sắp xếp backend cho phép, dạng "key" hoặc "key,asc|desc" */
  sort?: string;
  q?: string;
}

/** Nhân sự: hồ sơ + cửa hàng phân bổ (kèm tên) + cờ quản lý cửa hàng. */
export interface EmployeeListItem extends EmployeeResponse {
  manager: boolean;
  assignments: (EmployeeStoreResponse & { storeName?: string | null })[];
}

export interface EmployeePageSummary {
  total: number;
  active: number;
  managers: number;
}

export interface EmployeePageParams extends PageParams {
  status?: string;
  storeId?: number;
  role?: "MANAGER" | "EMPLOYEE";
  /** Vị trí theo vai trò tài khoản */
  position?: "STORE_MANAGER" | "EMPLOYEE";
  assignmentStatus?: string;
  primary?: boolean;
}

export interface AttendancePageSummary {
  total: number;
  pendingCheckout: number;
  absent: number;
  /** Đi muộn hoặc bị từ chối duyệt */
  violations: number;
}

export interface AttendancePageParams extends PageParams {
  status?: string;
  employeeId?: number;
  from?: string;
  to?: string;
}

export type AttendancePage = PageResult<AttendanceResponse, AttendancePageSummary>;

/** Tài khoản kèm vai trò hiện tại (roleId / roleCode null = chưa gán vai trò). */
export interface AccountListItem {
  id: number;
  username: string;
  email: string | null;
  phone: string | null;
  status: string;
  lastLoginAt: string | null;
  createdAt: string | null;
  roleId: number | null;
  roleCode: string | null;
  roleName: string | null;
}

export interface AccountPageSummary {
  total: number;
  /** Quản lý + trưởng cửa hàng */
  managers: number;
  employees: number;
  locked: number;
  /** Quản lý (MANAGER) đang hoạt động – để chặn khóa quản lý cuối cùng */
  activeManagers: number;
}

export interface AccountPageParams extends PageParams {
  role?: string;
  status?: string;
}
