"use client";

import React, { useEffect, useState } from "react";
import {
  Code,
  Activity,
  RefreshCw,
  Play,
  ShieldCheck,
  Terminal,
  ExternalLink,
  Search,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { UserRoleCode } from "@/types/auth";
import {
  adminApiIntegration,
  adminUserApi,
  AuditLogResponse,
  PermissionResponse,
  RolePermissionResponse,
  RoleResponse,
} from "@/lib/adminApi";

export interface ApiEndpointItem {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  name: string;
  desc: string;
  module: string;
  controller: string;
  roles: UserRoleCode[];
  status?: string;
  latency?: string;
}

function moduleFromPath(path: string): string {
  const resource = path.replace(/^\/api\/v1\//, "").split("/")[0];
  const labels: Record<string, string> = {
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
  return labels[resource] || "API khác";
}

function endpointsFromPermissions(
  permissions: PermissionResponse[],
  roles: RoleResponse[],
  rolePermissions: RolePermissionResponse[]
): ApiEndpointItem[] {
  const roleById = new Map(roles.map((role) => [role.roleId, role.roleCode]));
  const rolesByPermission = new Map<number, UserRoleCode[]>();

  rolePermissions.forEach(({ permissionId, roleId }) => {
    const roleCode = roleById.get(roleId);
    if (roleCode && ["ADMIN", "MANAGER", "STORE_MANAGER", "EMPLOYEE"].includes(roleCode)) {
      const existing = rolesByPermission.get(permissionId) || [];
      if (!existing.includes(roleCode as UserRoleCode)) {
        existing.push(roleCode as UserRoleCode);
      }
      rolesByPermission.set(permissionId, existing);
    }
  });

  return permissions
    .filter((permission) => permission.apiPath && permission.method)
    .map((permission) => ({
      id: `permission_${permission.permissionId}`,
      method: permission.method!.toUpperCase() as ApiEndpointItem["method"],
      path: permission.apiPath!,
      name: permission.permissionName,
      desc: permission.description || permission.permissionCode,
      module: moduleFromPath(permission.apiPath!),
      controller: "Backend permission",
      roles: rolesByPermission.get(permission.permissionId) || [],
    }));
}

// TOÀN BỘ API HỆ THỐNG SCHEDULE SYSTEM / BLOAN
export const allApiEndpoints: ApiEndpointItem[] = [
  // 1. AUTHENTICATION
  {
    id: "auth_1",
    method: "POST",
    path: "/api/v1/auth/login",
    name: "Đăng nhập người dùng",
    desc: "Xác thực danh tính, cấp JWT access_token & refresh_token kèm roleCode",
    module: "Xác thực & Phiên",
    controller: "AuthController",
    roles: ["ADMIN", "MANAGER", "STORE_MANAGER", "EMPLOYEE"],
    status: "200 OK",
    latency: "35ms",
  },
  {
    id: "auth_2",
    method: "POST",
    path: "/api/v1/auth/register",
    name: "Đăng ký tài khoản",
    desc: "Đăng ký tài khoản nhân viên mới trên hệ thống chuỗi",
    module: "Xác thực & Phiên",
    controller: "AuthController",
    roles: ["ADMIN", "MANAGER"],
    status: "201 Created",
    latency: "52ms",
  },
  {
    id: "auth_3",
    method: "POST",
    path: "/api/v1/auth/confirm",
    name: "Kích hoạt tài khoản",
    desc: "Xác nhận mã kích hoạt tài khoản gửi qua email",
    module: "Xác thực & Phiên",
    controller: "AuthController",
    roles: ["ADMIN", "MANAGER", "STORE_MANAGER", "EMPLOYEE"],
    status: "200 OK",
    latency: "28ms",
  },
  {
    id: "auth_4",
    method: "POST",
    path: "/api/v1/auth/refresh",
    name: "Làm mới Access Token",
    desc: "Cấp mới Access Token bằng Refresh Token khi hết hạn",
    module: "Xác thực & Phiên",
    controller: "AuthController",
    roles: ["ADMIN", "MANAGER", "STORE_MANAGER", "EMPLOYEE"],
    status: "200 OK",
    latency: "22ms",
  },
  {
    id: "auth_5",
    method: "POST",
    path: "/api/v1/auth/forgot-password",
    name: "Quên mật khẩu",
    desc: "Gửi email yêu cầu đặt lại mật khẩu kèm mã token bảo mật",
    module: "Xác thực & Phiên",
    controller: "AuthController",
    roles: ["ADMIN", "MANAGER", "STORE_MANAGER", "EMPLOYEE"],
    status: "200 OK",
    latency: "45ms",
  },
  {
    id: "auth_6",
    method: "POST",
    path: "/api/v1/auth/reset-password",
    name: "Đặt lại mật khẩu",
    desc: "Thiết lập mật khẩu mới thông qua token xác thực",
    module: "Xác thực & Phiên",
    controller: "AuthController",
    roles: ["ADMIN", "MANAGER", "STORE_MANAGER", "EMPLOYEE"],
    status: "200 OK",
    latency: "38ms",
  },

  // 2. USER & PHÂN QUYỀN RBAC
  {
    id: "user_1",
    method: "GET",
    path: "/api/v1/user",
    name: "Danh sách tài khoản",
    desc: "Lấy danh sách người dùng toàn hệ thống (không chứa passwordHash)",
    module: "Tài khoản & Phân quyền",
    controller: "UserController",
    roles: ["ADMIN", "MANAGER"],
    status: "200 OK",
    latency: "32ms",
  },
  {
    id: "user_2",
    method: "GET",
    path: "/api/v1/user/{id}",
    name: "Chi tiết tài khoản",
    desc: "Lấy thông tin tài khoản theo User ID",
    module: "Tài khoản & Phân quyền",
    controller: "UserController",
    roles: ["ADMIN", "MANAGER"],
    status: "200 OK",
    latency: "25ms",
  },
  {
    id: "user_3",
    method: "POST",
    path: "/api/v1/user",
    name: "Tạo tài khoản mới",
    desc: "Khởi tạo tài khoản người dùng mới trong cơ sở dữ liệu",
    module: "Tài khoản & Phân quyền",
    controller: "UserController",
    roles: ["ADMIN"],
    status: "201 Created",
    latency: "48ms",
  },
  {
    id: "user_4",
    method: "PUT",
    path: "/api/v1/user/{id}",
    name: "Cập nhật tài khoản",
    desc: "Cập nhật email, số điện thoại hoặc trạng thái khóa tài khoản",
    module: "Tài khoản & Phân quyền",
    controller: "UserController",
    roles: ["ADMIN"],
    status: "200 OK",
    latency: "40ms",
  },
  {
    id: "user_5",
    method: "DELETE",
    path: "/api/v1/user/{id}",
    name: "Xóa tài khoản",
    desc: "Xóa vĩnh viễn tài khoản khỏi hệ thống (204 No Content)",
    module: "Tài khoản & Phân quyền",
    controller: "UserController",
    roles: ["ADMIN"],
    status: "204 No Content",
    latency: "30ms",
  },
  {
    id: "role_1",
    method: "GET",
    path: "/api/v1/role",
    name: "Danh sách vai trò",
    desc: "Lấy danh sách các nhóm vai trò trong hệ thống (roleId, roleCode, roleName)",
    module: "Tài khoản & Phân quyền",
    controller: "RoleController",
    roles: ["ADMIN", "MANAGER"],
    status: "200 OK",
    latency: "20ms",
  },
  {
    id: "role_2",
    method: "POST",
    path: "/api/v1/role",
    name: "Tạo vai trò mới",
    desc: "Tạo mới định danh vai trò phân quyền",
    module: "Tài khoản & Phân quyền",
    controller: "RoleController",
    roles: ["ADMIN"],
    status: "201 Created",
    latency: "35ms",
  },
  {
    id: "role_3",
    method: "PUT",
    path: "/api/v1/role/{id}",
    name: "Cập nhật vai trò",
    desc: "Cập nhật tên và mô tả vai trò",
    module: "Tài khoản & Phân quyền",
    controller: "RoleController",
    roles: ["ADMIN"],
    status: "200 OK",
    latency: "30ms",
  },
  {
    id: "perm_1",
    method: "GET",
    path: "/api/v1/permission",
    name: "Danh sách quyền hạn API",
    desc: "Lấy danh mục các quyền hạn (permissionId, permissionCode, apiPath, method)",
    module: "Tài khoản & Phân quyền",
    controller: "PermissionController",
    roles: ["ADMIN"],
    status: "200 OK",
    latency: "22ms",
  },
  {
    id: "perm_2",
    method: "POST",
    path: "/api/v1/permission",
    name: "Tạo quyền hạn mới",
    desc: "Định nghĩa quyền hạn truy cập API mới",
    module: "Tài khoản & Phân quyền",
    controller: "PermissionController",
    roles: ["ADMIN"],
    status: "201 Created",
    latency: "32ms",
  },
  {
    id: "urole_1",
    method: "GET",
    path: "/api/v1/user_role",
    name: "Danh sách gán vai trò người dùng",
    desc: "Danh sách quan hệ nhiều-nhiều User và Role",
    module: "Tài khoản & Phân quyền",
    controller: "UserRoleController",
    roles: ["ADMIN", "MANAGER"],
    status: "200 OK",
    latency: "24ms",
  },
  {
    id: "urole_2",
    method: "POST",
    path: "/api/v1/user_role",
    name: "Gán vai trò cho người dùng",
    desc: "Gán Role cho User (Body: { userId, roleId })",
    module: "Tài khoản & Phân quyền",
    controller: "UserRoleController",
    roles: ["ADMIN"],
    status: "201 Created",
    latency: "36ms",
  },
  {
    id: "urole_3",
    method: "DELETE",
    path: "/api/v1/user_role",
    name: "Gỡ vai trò khỏi người dùng",
    desc: "Xóa vai trò của User bằng Body JSON { userId, roleId }",
    module: "Tài khoản & Phân quyền",
    controller: "UserRoleController",
    roles: ["ADMIN"],
    status: "204 No Content",
    latency: "28ms",
  },
  {
    id: "rperm_1",
    method: "GET",
    path: "/api/v1/role_permission",
    name: "Ma trận quyền theo vai trò",
    desc: "Lấy danh sách các quyền hạn được gán cho từng vai trò",
    module: "Tài khoản & Phân quyền",
    controller: "RolePermissionController",
    roles: ["ADMIN"],
    status: "200 OK",
    latency: "25ms",
  },
  {
    id: "rperm_2",
    method: "POST",
    path: "/api/v1/role_permission",
    name: "Cấp quyền API cho vai trò",
    desc: "Gán Permission cho Role (Body: { roleId, permissionId })",
    module: "Tài khoản & Phân quyền",
    controller: "RolePermissionController",
    roles: ["ADMIN"],
    status: "201 Created",
    latency: "30ms",
  },
  {
    id: "rperm_3",
    method: "DELETE",
    path: "/api/v1/role_permission",
    name: "Thu hồi quyền API khỏi vai trò",
    desc: "Xóa quyền khỏi vai trò qua Body JSON { roleId, permissionId }",
    module: "Tài khoản & Phân quyền",
    controller: "RolePermissionController",
    roles: ["ADMIN"],
    status: "204 No Content",
    latency: "26ms",
  },

  // 3. NHÂN SỰ (EMPLOYEE)
  {
    id: "emp_1",
    method: "GET",
    path: "/api/v1/employees",
    name: "Danh sách hồ sơ nhân viên",
    desc: "Lấy danh sách nhân sự toàn chuỗi, hỗ trợ lọc theo status",
    module: "Quản lý Nhân sự",
    controller: "EmployeeController",
    roles: ["ADMIN", "MANAGER", "STORE_MANAGER"],
    status: "200 OK",
    latency: "44ms",
  },
  {
    id: "emp_2",
    method: "GET",
    path: "/api/v1/employees/{id}",
    name: "Chi tiết hồ sơ nhân sự",
    desc: "Lấy đầy đủ thông tin cá nhân, CCCD và hợp đồng",
    module: "Quản lý Nhân sự",
    controller: "EmployeeController",
    roles: ["ADMIN", "MANAGER", "STORE_MANAGER"],
    status: "200 OK",
    latency: "30ms",
  },
  {
    id: "emp_3",
    method: "POST",
    path: "/api/v1/employees",
    name: "Thêm hồ sơ nhân viên mới",
    desc: "Multipart form-data: thông tin nhân viên kèm ảnh thẻ CCCD 2 mặt",
    module: "Quản lý Nhân sự",
    controller: "EmployeeController",
    roles: ["ADMIN", "MANAGER"],
    status: "201 Created",
    latency: "85ms",
  },
  {
    id: "emp_4",
    method: "PUT",
    path: "/api/v1/employees/{id}",
    name: "Cập nhật hồ sơ nhân viên",
    desc: "Cập nhật thông tin hồ sơ nhân viên",
    module: "Quản lý Nhân sự",
    controller: "EmployeeController",
    roles: ["ADMIN", "MANAGER", "STORE_MANAGER"],
    status: "200 OK",
    latency: "45ms",
  },

  // 4. MẠNG LƯỚI CỬA HÀNG (STORE)
  {
    id: "store_1",
    method: "GET",
    path: "/api/v1/stores",
    name: "Danh sách cửa hàng toàn chuỗi",
    desc: "Lấy danh sách tất cả các chi nhánh cửa hàng Ăn Vặt BLOAN",
    module: "Mạng lưới Cửa hàng",
    controller: "StoreController",
    roles: ["ADMIN", "MANAGER", "STORE_MANAGER", "EMPLOYEE"],
    status: "200 OK",
    latency: "32ms",
  },
  {
    id: "store_2",
    method: "GET",
    path: "/api/v1/stores/{id}",
    name: "Chi tiết cửa hàng",
    desc: "Lấy thông tin địa chỉ, hotline, quản lý chi nhánh",
    module: "Mạng lưới Cửa hàng",
    controller: "StoreController",
    roles: ["ADMIN", "MANAGER", "STORE_MANAGER"],
    status: "200 OK",
    latency: "24ms",
  },
  {
    id: "store_3",
    method: "POST",
    path: "/api/v1/stores",
    name: "Mở chi nhánh cửa hàng mới",
    desc: "Khai báo cửa hàng mới vào mạng lưới kinh doanh",
    module: "Mạng lưới Cửa hàng",
    controller: "StoreController",
    roles: ["ADMIN"],
    status: "201 Created",
    latency: "55ms",
  },
  {
    id: "store_4",
    method: "PUT",
    path: "/api/v1/stores/{id}",
    name: "Cập nhật thông tin cửa hàng",
    desc: "Thay đổi thông tin liên hệ hoặc trạng thái hoạt động cửa hàng",
    module: "Mạng lưới Cửa hàng",
    controller: "StoreController",
    roles: ["ADMIN", "MANAGER"],
    status: "200 OK",
    latency: "38ms",
  },

  // 5. CA LÀM & LỊCH XẾP CA (SHIFT & SCHEDULE)
  {
    id: "shift_1",
    method: "GET",
    path: "/api/v1/shift",
    name: "Danh mục ca mẫu",
    desc: "Lấy danh mục các khung ca chuẩn: Ca Sáng, Ca Chiều, Ca Tối, Ca Đêm",
    module: "Ca làm & Lịch biểu",
    controller: "ShiftController",
    roles: ["ADMIN", "MANAGER", "STORE_MANAGER", "EMPLOYEE"],
    status: "200 OK",
    latency: "28ms",
  },
  {
    id: "shift_2",
    method: "GET",
    path: "/api/v1/schedule_period",
    name: "Danh sách kỳ mở đăng ký ca",
    desc: "Lấy các kỳ đăng ký lịch làm việc theo tuần / tháng",
    module: "Ca làm & Lịch biểu",
    controller: "SchedulePeriodController",
    roles: ["ADMIN", "MANAGER", "STORE_MANAGER"],
    status: "200 OK",
    latency: "30ms",
  },
  {
    id: "shift_3",
    method: "GET",
    path: "/api/v1/schedule/calendar",
    name: "Xem lịch biểu dạng Calendar",
    desc: "Lấy dữ liệu hiển thị lịch tuần/tháng theo khoảng ngày (?from=&to=)",
    module: "Ca làm & Lịch biểu",
    controller: "ScheduleController",
    roles: ["ADMIN", "MANAGER", "STORE_MANAGER", "EMPLOYEE"],
    status: "200 OK",
    latency: "50ms",
  },
  {
    id: "shift_4",
    method: "GET",
    path: "/api/v1/schedule/shifts",
    name: "Danh sách ca làm việc theo cửa hàng",
    desc: "Lấy các ca mở theo chi nhánh (?storeId=)",
    module: "Ca làm & Lịch biểu",
    controller: "ScheduleController",
    roles: ["ADMIN", "MANAGER", "STORE_MANAGER", "EMPLOYEE"],
    status: "200 OK",
    latency: "42ms",
  },
  {
    id: "shift_5",
    method: "GET",
    path: "/api/v1/schedule/assignments",
    name: "Danh sách phân ca nhân sự",
    desc: "Lấy danh sách các ca đã được gán nhân sự trực tiếp",
    module: "Ca làm & Lịch biểu",
    controller: "ScheduleController",
    roles: ["ADMIN", "MANAGER", "STORE_MANAGER", "EMPLOYEE"],
    status: "200 OK",
    latency: "38ms",
  },
  {
    id: "shift_6",
    method: "POST",
    path: "/api/v1/schedule/assignments",
    name: "Đăng ký / Xếp nhân viên vào ca",
    desc: "Nhân viên đăng ký ca hoặc Quản lý xếp nhân viên vào ca làm",
    module: "Ca làm & Lịch biểu",
    controller: "ScheduleController",
    roles: ["ADMIN", "MANAGER", "STORE_MANAGER", "EMPLOYEE"],
    status: "201 Created",
    latency: "46ms",
  },
  {
    id: "shift_7",
    method: "POST",
    path: "/api/v1/emergency_request",
    name: "Yêu cầu khẩn cấp đổi/hủy ca",
    desc: "Gửi đơn đổi ca giữa 2 nhân sự hoặc báo nghỉ khẩn cấp",
    module: "Ca làm & Lịch biểu",
    controller: "EmergencyRequestController",
    roles: ["STORE_MANAGER", "EMPLOYEE"],
    status: "201 Created",
    latency: "52ms",
  },

  // 6. CHẤM CÔNG (ATTENDANCE)
  {
    id: "att_1",
    method: "GET",
    path: "/api/v1/attendance",
    name: "Dữ liệu chấm công",
    desc: "Lấy danh sách dữ liệu chấm công toàn chuỗi hoặc theo nhân viên",
    module: "Chấm công & Điểm danh",
    controller: "AttendanceController",
    roles: ["ADMIN", "MANAGER", "STORE_MANAGER", "EMPLOYEE"],
    status: "200 OK",
    latency: "40ms",
  },
  {
    id: "att_2",
    method: "POST",
    path: "/api/v1/attendance/check-in",
    name: "Check-in điểm danh vào ca",
    desc: "Nhận diện FaceID / QR code / tọa độ GPS khi bắt đầu ca làm việc",
    module: "Chấm công & Điểm danh",
    controller: "AttendanceController",
    roles: ["ADMIN", "MANAGER", "STORE_MANAGER", "EMPLOYEE"],
    status: "200 OK",
    latency: "48ms",
  },
  {
    id: "att_3",
    method: "PUT",
    path: "/api/v1/attendance/{id}",
    name: "Duyệt / Hiệu chỉnh giờ công",
    desc: "Quản lý cửa hàng hoặc Quản lý chuỗi duyệt giải trình công",
    module: "Chấm công & Điểm danh",
    controller: "AttendanceController",
    roles: ["ADMIN", "MANAGER", "STORE_MANAGER"],
    status: "200 OK",
    latency: "34ms",
  },

  // 7. LƯƠNG & THƯỞNG (PAYROLL & BONUS)
  {
    id: "pay_1",
    method: "GET",
    path: "/api/v1/payroll",
    name: "Bảng tính lương tháng",
    desc: "Lấy bảng tổng hợp quỹ lương toàn bộ chi nhánh theo chu kỳ",
    module: "Lương & Khen thưởng",
    controller: "PayrollController",
    roles: ["ADMIN", "MANAGER"],
    status: "200 OK",
    latency: "62ms",
  },
  {
    id: "pay_2",
    method: "POST",
    path: "/api/v1/payroll",
    name: "Chốt và xuất bảng lương",
    desc: "Chốt kỳ tính lương tháng và sinh phiếu lương tự động",
    module: "Lương & Khen thưởng",
    controller: "PayrollController",
    roles: ["ADMIN", "MANAGER"],
    status: "201 Created",
    latency: "120ms",
  },
  {
    id: "pay_3",
    method: "GET",
    path: "/api/v1/payroll_detail",
    name: "Chi tiết phiếu lương nhân sự",
    desc: "Xem chi tiết tiền lương, phụ cấp, thưởng và các khoản khấu trừ",
    module: "Lương & Khen thưởng",
    controller: "PayrollDetailController",
    roles: ["ADMIN", "MANAGER", "STORE_MANAGER", "EMPLOYEE"],
    status: "200 OK",
    latency: "35ms",
  },
  {
    id: "pay_4",
    method: "GET",
    path: "/api/v1/bonus_record",
    name: "Danh sách phiếu thưởng",
    desc: "Danh sách khen thưởng KPI, thưởng chuyên cần, năng suất",
    module: "Lương & Khen thưởng",
    controller: "BonusRecordController",
    roles: ["ADMIN", "MANAGER", "STORE_MANAGER"],
    status: "200 OK",
    latency: "30ms",
  },
  {
    id: "pay_5",
    method: "POST",
    path: "/api/v1/bonus_record",
    name: "Tạo phiếu khen thưởng",
    desc: "Trưởng cửa hàng hoặc Quản lý tạo phiếu đề xuất thưởng nhân viên",
    module: "Lương & Khen thưởng",
    controller: "BonusRecordController",
    roles: ["ADMIN", "MANAGER", "STORE_MANAGER"],
    status: "201 Created",
    latency: "45ms",
  },

  // 8. NỘI QUY & VI PHẠM (VIOLATION & DISCIPLINE)
  {
    id: "vio_1",
    method: "GET",
    path: "/api/v1/violation",
    name: "Danh mục lỗi vi phạm",
    desc: "Bảng tra cứu các lỗi vi phạm nội quy và mức chế tài",
    module: "Nội quy & Kỷ luật",
    controller: "ViolationController",
    roles: ["ADMIN", "MANAGER", "STORE_MANAGER"],
    status: "200 OK",
    latency: "26ms",
  },
  {
    id: "vio_2",
    method: "GET",
    path: "/api/v1/disciplinary_record",
    name: "Danh sách biên bản vi phạm",
    desc: "Lấy danh sách các biên bản xử lý kỷ luật trong ca làm việc",
    module: "Nội quy & Kỷ luật",
    controller: "DisciplinaryRecordController",
    roles: ["ADMIN", "MANAGER", "STORE_MANAGER"],
    status: "200 OK",
    latency: "32ms",
  },
  {
    id: "vio_3",
    method: "POST",
    path: "/api/v1/disciplinary_record",
    name: "Lập biên bản vi phạm",
    desc: "Trưởng cửa hàng lập biên bản xử lý vi phạm trong ca trực",
    module: "Nội quy & Kỷ luật",
    controller: "DisciplinaryRecordController",
    roles: ["ADMIN", "MANAGER", "STORE_MANAGER"],
    status: "201 Created",
    latency: "48ms",
  },
  {
    id: "vio_4",
    method: "GET",
    path: "/api/v1/rule",
    name: "Quy chế & Nội quy chuỗi",
    desc: "Danh sách các điều khoản nội quy chuẩn Ăn Vặt BLOAN",
    module: "Nội quy & Kỷ luật",
    controller: "RuleController",
    roles: ["ADMIN", "MANAGER", "STORE_MANAGER", "EMPLOYEE"],
    status: "200 OK",
    latency: "22ms",
  },

  // 9. FEEDBACK & ĐÁNH GIÁ (FEEDBACK & EVALUATION)
  {
    id: "feed_1",
    method: "GET",
    path: "/api/v1/feedback",
    name: "Hộp thư phản hồi & góp ý",
    desc: "Danh sách ý kiến đóng góp, khiếu nại công ca từ nhân viên",
    module: "Khảo sát & Phản hồi",
    controller: "FeedbackController",
    roles: ["ADMIN", "MANAGER", "STORE_MANAGER"],
    status: "200 OK",
    latency: "30ms",
  },
  {
    id: "feed_2",
    method: "POST",
    path: "/api/v1/feedback",
    name: "Gửi ý kiến phản hồi",
    desc: "Nhân sự gửi đóng góp ẩn danh hoặc công khai",
    module: "Khảo sát & Phản hồi",
    controller: "FeedbackController",
    roles: ["ADMIN", "MANAGER", "STORE_MANAGER", "EMPLOYEE"],
    status: "201 Created",
    latency: "42ms",
  },
  {
    id: "eval_1",
    method: "GET",
    path: "/api/v1/employee_evaluation",
    name: "Đánh giá xếp loại nhân sự",
    desc: "Bảng tổng hợp xếp loại năng lực nhân viên theo tháng",
    module: "Đánh giá & Khảo sát",
    controller: "EmployeeEvaluationController",
    roles: ["ADMIN", "MANAGER", "STORE_MANAGER"],
    status: "200 OK",
    latency: "36ms",
  },

  // 10. ĐÀO TẠO & BÀI TEST (TRAINING & TEST)
  {
    id: "test_1",
    method: "GET",
    path: "/api/v1/test",
    name: "Danh sách bài test nghiệp vụ",
    desc: "Các bài sát hạch nghiệp vụ định kỳ hàng tháng",
    module: "Đào tạo & Sát hạch",
    controller: "TestController",
    roles: ["ADMIN", "MANAGER", "STORE_MANAGER", "EMPLOYEE"],
    status: "200 OK",
    latency: "28ms",
  },
  {
    id: "test_2",
    method: "POST",
    path: "/api/v1/test_result",
    name: "Nộp bài làm sát hạch",
    desc: "Gửi kết quả bài thi trắc nghiệm nghiệp vụ",
    module: "Đào tạo & Sát hạch",
    controller: "TestResultController",
    roles: ["STORE_MANAGER", "EMPLOYEE"],
    status: "201 Created",
    latency: "50ms",
  },

  // 11. THÔNG BÁO & EMAIL (NOTIFICATION)
  {
    id: "noti_1",
    method: "GET",
    path: "/api/v1/notification",
    name: "Hộp thư thông báo",
    desc: "Lấy danh sách thông báo gửi đến tài khoản người dùng",
    module: "Thông báo & Truyền thông",
    controller: "NotificationController",
    roles: ["ADMIN", "MANAGER", "STORE_MANAGER", "EMPLOYEE"],
    status: "200 OK",
    latency: "24ms",
  },
  {
    id: "noti_2",
    method: "POST",
    path: "/api/v1/notification",
    name: "Gửi thông báo đẩy toàn chuỗi",
    desc: "Admin / Quản lý gửi thông báo đến các chi nhánh hoặc toàn thể nhân viên",
    module: "Thông báo & Truyền thông",
    controller: "NotificationController",
    roles: ["ADMIN", "MANAGER"],
    status: "201 Created",
    latency: "60ms",
  },
  {
    id: "noti_3",
    method: "GET",
    path: "/api/v1/notification_template",
    name: "Mẫu email & thông báo tự động",
    desc: "Quản lý mẫu template email kích hoạt, báo lịch làm, gửi biên bản",
    module: "Thông báo & Truyền thông",
    controller: "NotificationTemplateController",
    roles: ["ADMIN"],
    status: "200 OK",
    latency: "30ms",
  },

  // 12. CẤU HÌNH & HỆ THỐNG (SYSTEM & AUDIT)
  {
    id: "sys_1",
    method: "GET",
    path: "/api/v1/system_config",
    name: "Cấu hình hệ thống toàn cục",
    desc: "Lấy các tham số cấu hình hệ thống, sinh mã tự động",
    module: "Cấu hình & Quản trị",
    controller: "SystemConfigController",
    roles: ["ADMIN"],
    status: "200 OK",
    latency: "20ms",
  },
  {
    id: "sys_2",
    method: "GET",
    path: "/api/v1/organization_setting",
    name: "Cấu hình thương hiệu & logo",
    desc: "Cấu hình tên chuỗi, logo, hotline, màu sắc nhận diện",
    module: "Cấu hình & Quản trị",
    controller: "OrganizationSettingController",
    roles: ["ADMIN"],
    status: "200 OK",
    latency: "22ms",
  },
  {
    id: "sys_3",
    method: "POST",
    path: "/api/v1/attachment/upload",
    name: "Upload tệp đính kèm",
    desc: "Upload hình ảnh minh chứng, logo, CCCD qua multipart/form-data",
    module: "Tệp tin & Đính kèm",
    controller: "AttachmentController",
    roles: ["ADMIN", "MANAGER", "STORE_MANAGER", "EMPLOYEE"],
    status: "201 Created",
    latency: "95ms",
  },
  {
    id: "sys_4",
    method: "GET",
    path: "/api/v1/audit_log",
    name: "Nhật ký truy vết hệ thống",
    desc: "Xem toàn bộ lịch sử thao tác, gọi API và truy cập hệ thống",
    module: "Cấu hình & Quản trị",
    controller: "AuditLogController",
    roles: ["ADMIN"],
    status: "200 OK",
    latency: "35ms",
  },
  {
    id: "sys_5",
    method: "GET",
    path: "/health",
    name: "Kiểm tra tình trạng máy chủ",
    desc: "Health check trạng thái hoạt động của Spring Boot Backend",
    module: "Hạ tầng & Giám sát",
    controller: "HealthController",
    roles: ["ADMIN", "MANAGER", "STORE_MANAGER", "EMPLOYEE"],
    status: "200 OK",
    latency: "15ms",
  },
];

interface RoleMeta {
  code: UserRoleCode;
  name: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  desc: string;
  scope: string;
}

const roleMetas: Record<UserRoleCode, RoleMeta> = {
  ADMIN: {
    code: "ADMIN",
    name: "Quản trị viên (Root Admin)",
    badgeBg: "bg-red-50",
    badgeText: "text-red-700",
    badgeBorder: "border-red-200",
    desc: "Toàn quyền quản trị hệ thống, tài khoản, cấu hình tham số, bảo mật và toàn bộ API",
    scope: "Toàn bộ hệ thống BLOAN (Toàn quyền 100%)",
  },
  MANAGER: {
    code: "MANAGER",
    name: "Quản lý chuỗi (Operation Manager)",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-700",
    badgeBorder: "border-blue-200",
    desc: "Quản lý vận hành toàn chuỗi chi nhánh, nhân sự, chốt bảng lương, duyệt ca và giải trình",
    scope: "Toàn bộ chi nhánh & Cụm cửa hàng",
  },
  STORE_MANAGER: {
    code: "STORE_MANAGER",
    name: "Trưởng cửa hàng (Store Manager)",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-800",
    badgeBorder: "border-amber-200",
    desc: "Xếp ca, đối soát chấm công, duyệt đổi ca nhân viên, lập biên bản và đề xuất khen thưởng tại cửa hàng",
    scope: "Cửa hàng phụ trách",
  },
  EMPLOYEE: {
    code: "EMPLOYEE",
    name: "Nhân viên (Staff / Member)",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
    badgeBorder: "border-emerald-200",
    desc: "Xem lịch làm việc cá nhân, đăng ký ca mở, điểm danh FaceID, xem phiếu lương và nộp bài kiểm tra",
    scope: "Dữ liệu cá nhân & Ca làm việc của mình",
  },
};

export default function QuanLyApiPage() {
  const [activeTab, setActiveTab] = useState<"endpoints" | "roles_permissions">("endpoints");
  const [endpoints, setEndpoints] = useState<ApiEndpointItem[]>([]);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogResponse[]>([]);

  // Filters cho danh sách All Endpoints
  const [searchEndpoint, setSearchEndpoint] = useState("");
  const [filterMethod, setFilterMethod] = useState<"ALL" | "GET" | "POST" | "PUT" | "DELETE">("ALL");
  const [filterModule, setFilterModule] = useState<string>("ALL");

  // Tab Role & APIs
  const [selectedRole, setSelectedRole] = useState<UserRoleCode>("ADMIN");
  const [roleApiSearch, setRoleApiSearch] = useState("");
  const [roleMethodFilter, setRoleMethodFilter] = useState<"ALL" | "GET" | "POST" | "PUT" | "DELETE">("ALL");

  // Ping test console
  const [testEndpoint, setTestEndpoint] = useState("/api/v1/auth/login");
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadApiData = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [permissionResponse, roleResponse, rolePermissionResponse, auditResponse] =
          await Promise.all([
            adminUserApi.getPermissions(),
            adminUserApi.getRoles(),
            adminUserApi.getRolePermissions(),
            adminApiIntegration.getAuditLogs(),
          ]);

        if (cancelled) return;
        setRoles(roleResponse.data);
        setAuditLogs(auditResponse.data);
        setEndpoints(
          endpointsFromPermissions(
            permissionResponse.data,
            roleResponse.data,
            rolePermissionResponse.data
          )
        );
        if (roleResponse.data.length > 0) {
          const firstSupportedRole = roleResponse.data.find((role) =>
            ["ADMIN", "MANAGER", "STORE_MANAGER", "EMPLOYEE"].includes(role.roleCode)
          );
          if (firstSupportedRole) {
            setSelectedRole(firstSupportedRole.roleCode as UserRoleCode);
          }
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Không thể tải danh mục API từ backend."
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadApiData();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleTestPing = async () => {
    setIsPinging(true);
    setPingResult(null);
    const startTime = Date.now();
    try {
      const health = await adminApiIntegration.checkHealth();
      const latency = Date.now() - startTime;
      setIsPinging(false);
      setPingResult(
        JSON.stringify(
          {
            statusCode: health.ok ? 200 : health.status,
            error: health.ok ? null : "Service Error",
            message: health.ok
              ? "Kết nối API Backend Spring Boot thành công"
              : `Máy chủ phản hồi mã ${health.status}`,
            data: {
              serverTime: new Date().toISOString(),
              endpoint: testEndpoint,
              status: health.ok ? "UP" : "DOWN",
              latency: `${latency}ms`,
              backendUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
            },
          },
          null,
          2
        )
      );
    } catch (err: unknown) {
      setIsPinging(false);
      setPingResult(
        JSON.stringify(
          {
            statusCode: 503,
            error: "Connection Refused",
            message: "Không thể kết nối đến máy chủ Backend (http://localhost:8080).",
            data: {
              serverTime: new Date().toISOString(),
              endpoint: testEndpoint,
              status: "OFFLINE",
              details:
                err instanceof Error
                  ? err.message
                  : "Kiểm tra lại Spring Boot đang chạy ở cổng 8080",
            },
          },
          null,
          2
        )
      );
    }
  };

  const allApiEndpoints = endpoints;
  const uniqueModules = Array.from(new Set(allApiEndpoints.map((ep) => ep.module)));

  // Lọc toàn bộ API
  const filteredEndpoints = allApiEndpoints.filter((ep) => {
    const matchSearch =
      ep.path.toLowerCase().includes(searchEndpoint.toLowerCase()) ||
      ep.name.toLowerCase().includes(searchEndpoint.toLowerCase()) ||
      ep.desc.toLowerCase().includes(searchEndpoint.toLowerCase()) ||
      ep.controller.toLowerCase().includes(searchEndpoint.toLowerCase());
    const matchMethod = filterMethod === "ALL" || ep.method === filterMethod;
    const matchMod = filterModule === "ALL" || ep.module === filterModule;
    return matchSearch && matchMethod && matchMod;
  });

  // Lọc API thuộc Role được chọn
  const apisOfSelectedRole = allApiEndpoints.filter((ep) => {
    const hasRole = ep.roles.includes(selectedRole);
    const matchSearch =
      ep.path.toLowerCase().includes(roleApiSearch.toLowerCase()) ||
      ep.name.toLowerCase().includes(roleApiSearch.toLowerCase()) ||
      ep.desc.toLowerCase().includes(roleApiSearch.toLowerCase()) ||
      ep.module.toLowerCase().includes(roleApiSearch.toLowerCase());
    const matchMethod = roleMethodFilter === "ALL" || ep.method === roleMethodFilter;
    return hasRole && matchSearch && matchMethod;
  });

  const getMethodBadge = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "POST":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PUT":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "DELETE":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg">
              ADMIN CENTER
            </span>
            <span className="text-slate-400 text-xs">/</span>
            <span className="text-slate-500 text-xs font-semibold">Tích hợp & Lập trình</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-1">
            Quản lý API & Phân quyền Endpoints
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Danh mục quyền API và phân quyền theo từng vai trò được đọc trực tiếp từ backend.
          </p>
        </div>

        {loadError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
            Không thể tải dữ liệu quản lý API: {loadError}
          </div>
        )}
        {isLoading && (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
            Đang tải quyền API, vai trò và liên kết phân quyền từ backend...
          </div>
        )}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => alert("Mở Swagger UI Backend: http://localhost:8080/swagger-ui.html")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs"
          >
            <ExternalLink className="w-4 h-4 text-slate-500" />
            <span>Tài liệu Swagger UI</span>
          </button>
          <button
            onClick={handleTestPing}
            disabled={isPinging}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold transition-all shadow-sm shadow-amber-200 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? "animate-spin" : ""}`} />
            <span>Kiểm tra kết nối</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Tổng Endpoints API</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-800 mt-1 tracking-tight">
              {allApiEndpoints.length}
            </div>
            <p className="text-[11px] text-emerald-600 mt-1 font-semibold">Đầy đủ 12 phân hệ nghiệp vụ</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Code className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Vai trò phân quyền (RBAC)</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-800 mt-1 tracking-tight">
              {roles.length} Roles
            </div>
            <p className="text-[11px] text-amber-700 mt-1 font-semibold">Admin, Manager, SM, Staff</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Phân hệ chức năng</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-800 mt-1 tracking-tight">
              {uniqueModules.length} Modules
            </div>
            <p className="text-[11px] text-emerald-600 mt-1 font-semibold">Bao quát toàn chuỗi BLOAN</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Tình trạng Backend</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1 tracking-tight">
              {isLoading ? "..." : loadError ? "OFFLINE" : "ONLINE"}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">Spring Boot v3.x · 200 OK</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs Bar - Chỉ 2 tab: Toàn bộ API và Role & APIs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => setActiveTab("endpoints")}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "endpoints"
              ? "bg-amber-500 text-slate-900 shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Code className="w-4 h-4" />
          <span>Danh mục toàn bộ API ({allApiEndpoints.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("roles_permissions")}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "roles_permissions"
              ? "bg-amber-500 text-slate-900 shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Role & API thuộc Role ({roles.length} Vai trò)</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: DANH MỤC TOÀN BỘ API                                   */}
      {/* ============================================================== */}
      {activeTab === "endpoints" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cột trái: Danh sách toàn bộ API */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
            {/* Filter Bar */}
            <div className="p-4 bg-slate-50/60 border-b border-slate-100 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    Toàn bộ API hệ thống ({filteredEndpoints.length}/{allApiEndpoints.length})
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Bấm vào từng endpoint để đưa vào Console kiểm tra kết nối
                  </p>
                </div>

                {/* Method pills */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                  {(["ALL", "GET", "POST", "PUT", "DELETE"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setFilterMethod(m)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                        filterMethod === m
                          ? "bg-amber-500 text-slate-900 shadow-xs"
                          : "text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search & Module filter */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-1 w-full">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchEndpoint}
                    onChange={(e) => setSearchEndpoint(e.target.value)}
                    placeholder="Tìm theo URL, tên chức năng, controller..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 font-medium text-slate-700"
                  />
                </div>
                <select
                  value={filterModule}
                  onChange={(e) => setFilterModule(e.target.value)}
                  className="w-full sm:w-48 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 font-medium text-slate-700"
                >
                  <option value="ALL">Tất cả Modules ({allApiEndpoints.length})</option>
                  {uniqueModules.map((mod) => (
                    <option key={mod} value={mod}>
                      {mod}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* List Endpoints */}
            <div className="divide-y divide-slate-100 text-xs overflow-y-auto max-h-[680px]">
              {filteredEndpoints.map((ep) => (
                <div
                  key={ep.id}
                  onClick={() => setTestEndpoint(ep.path)}
                  className={`p-4 hover:bg-slate-50/80 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    testEndpoint === ep.path ? "bg-amber-50/40 border-l-4 border-amber-500" : ""
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${getMethodBadge(
                          ep.method
                        )}`}
                      >
                        {ep.method}
                      </span>
                      <span className="font-mono font-bold text-slate-800 text-xs truncate">
                        {ep.path}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold bg-slate-100 px-2 py-0.2 rounded">
                        {ep.module}
                      </span>
                    </div>

                    <p className="text-slate-800 font-bold text-xs">{ep.name}</p>
                    <p className="text-slate-500 text-[11px] line-clamp-1">{ep.desc}</p>

                    {/* Roles có quyền gọi API này */}
                    <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                      <span className="text-[10px] text-slate-400 font-semibold">Quyền gọi:</span>
                      {ep.roles.map((r) => {
                        const rMeta = roleMetas[r];
                        return (
                          <span
                            key={r}
                            className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${rMeta.badgeBg} ${rMeta.badgeText} ${rMeta.badgeBorder}`}
                          >
                            {r}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1">
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {ep.status || "Đã cấu hình"}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTestEndpoint(ep.path);
                        handleTestPing();
                      }}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-1 rounded-lg transition-colors"
                    >
                      <Play className="w-3 h-3 fill-amber-700" />
                      <span>Ping</span>
                    </button>
                  </div>
                </div>
              ))}

              {filteredEndpoints.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Không tìm thấy endpoint nào phù hợp với bộ lọc.
                </div>
              )}
            </div>
          </div>

          {/* Cột phải: Terminal Test Ping Console */}
          <div className="lg:col-span-5 bg-slate-900 rounded-2xl border border-slate-800 shadow-md p-5 text-white flex flex-col justify-between sticky top-4 h-fit min-h-[500px]">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-xs text-slate-200">API Health Test Console</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-emerald-400 font-bold font-mono">BACKEND READY</span>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Endpoint URL để thử nghiệm:
                  </label>
                  <input
                    type="text"
                    value={testEndpoint}
                    onChange={(e) => setTestEndpoint(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl font-mono text-xs text-amber-300 outline-hidden"
                  />
                </div>

                <button
                  onClick={handleTestPing}
                  disabled={isPinging}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-xs transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isPinging ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang ping máy chủ...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-slate-900" />
                      <span>Thực thi kiểm tra kết nối</span>
                    </>
                  )}
                </button>
              </div>

              <div className="mt-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Phản hồi từ Spring Boot Server:
                </p>
                <pre className="p-3 bg-slate-950 rounded-xl text-[11px] font-mono text-emerald-400 border border-slate-800 overflow-x-auto min-h-[160px] max-h-[260px]">
                  {pingResult || `// Bấm "Thực thi kiểm tra kết nối" để xem response thực tế từ Spring Boot...`}
                </pre>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-400 font-mono mt-4">
              Base URL: {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"} · REST Contract v1
            </div>
          </div>
        </div>
      ) : activeTab === "roles_permissions" ? (
        /* ============================================================== */
        /* TAB 2: ROLE VÀ CÁC API THUỘC ROLE ĐÓ (THEO YÊU CẦU CỦA BẠN)    */
        /* ============================================================== */
        <div className="space-y-6">
          {/* 4 Thẻ chọn Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {roles
              .map((role) => role.roleCode)
              .filter((rCode): rCode is UserRoleCode =>
                ["ADMIN", "MANAGER", "STORE_MANAGER", "EMPLOYEE"].includes(rCode)
              )
              .map((rCode) => {
              const rMeta = roleMetas[rCode];
              const isSelected = selectedRole === rCode;
              const countApis = allApiEndpoints.filter((ep) => ep.roles.includes(rCode)).length;
              const percentage = Math.round((countApis / allApiEndpoints.length) * 100);

              return (
                <button
                  key={rCode}
                  onClick={() => setSelectedRole(rCode)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? "bg-amber-500/10 border-amber-500 shadow-md ring-2 ring-amber-400/50"
                      : "bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50 shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${rMeta.badgeBg} ${rMeta.badgeText} ${rMeta.badgeBorder}`}
                    >
                      {rCode}
                    </span>
                    <span className="text-xs font-black text-slate-800 font-mono">
                      {countApis}/{allApiEndpoints.length} API
                    </span>
                  </div>

                  <h4 className="font-extrabold text-slate-800 text-sm">{rMeta.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {rMeta.desc}
                  </p>

                  {/* Progress bar mức độ truy cập */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mb-1">
                      <span>Phạm vi quyền API:</span>
                      <span className="font-black text-slate-700">{percentage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          rCode === "ADMIN"
                            ? "bg-red-500"
                            : rCode === "MANAGER"
                            ? "bg-blue-500"
                            : rCode === "STORE_MANAGER"
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Khung chi tiết danh sách API của Role được chọn */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Header của Role đang xem */}
            <div className="p-5 bg-slate-50/70 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-xs font-black px-3 py-1 rounded-full border ${
                      roleMetas[selectedRole].badgeBg
                    } ${roleMetas[selectedRole].badgeText} ${roleMetas[selectedRole].badgeBorder}`}
                  >
                    VAI TRÒ: {selectedRole}
                  </span>
                  <span className="text-slate-400 text-xs">·</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {roleMetas[selectedRole].name}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Đang hiển thị <strong className="text-slate-800">{apisOfSelectedRole.length}</strong> API được cấp phép cho vai trò <strong className="text-slate-800">[{selectedRole}]</strong>.
                </p>
              </div>

              {/* Bộ lọc Method & Tìm kiếm trong Role */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={roleApiSearch}
                    onChange={(e) => setRoleApiSearch(e.target.value)}
                    placeholder={`Tìm API trong vai trò ${selectedRole}...`}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 font-medium text-slate-700"
                  />
                </div>

                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 w-full sm:w-auto justify-center">
                  {(["ALL", "GET", "POST", "PUT", "DELETE"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setRoleMethodFilter(m)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                        roleMethodFilter === m
                          ? "bg-amber-500 text-slate-900 shadow-xs"
                          : "text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bảng API của Role */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3 w-28">Phương thức</th>
                    <th className="px-5 py-3">Tuyến đường API (Path)</th>
                    <th className="px-5 py-3">Tên quyền & Chức năng</th>
                    <th className="px-5 py-3">Phân hệ / Controller</th>
                    <th className="px-5 py-3 text-center">Loại quyền</th>
                    <th className="px-5 py-3 text-right">Trạng thái quyền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {apisOfSelectedRole.map((ep) => {
                    const actionType =
                      ep.method === "GET"
                        ? { label: "Đọc dữ liệu (Read)", color: "text-emerald-700 bg-emerald-50 border-emerald-200" }
                        : ep.method === "POST"
                        ? { label: "Thêm mới (Create)", color: "text-blue-700 bg-blue-50 border-blue-200" }
                        : ep.method === "PUT"
                        ? { label: "Cập nhật (Update)", color: "text-amber-700 bg-amber-50 border-amber-200" }
                        : { label: "Xóa bỏ (Delete)", color: "text-rose-700 bg-rose-50 border-rose-200" };

                    return (
                      <tr key={ep.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3.5">
                          <span
                            className={`text-[10px] font-black px-2.5 py-1 rounded-md border ${getMethodBadge(
                              ep.method
                            )}`}
                          >
                            {ep.method}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-mono font-bold text-slate-800 text-xs">{ep.path}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{ep.desc}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-bold text-slate-800">{ep.name}</p>
                          <span className="text-[10px] font-mono text-slate-400">
                            ROLE_{ep.id.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">
                          <p className="font-semibold text-slate-700">{ep.module}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{ep.controller}</p>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${actionType.color}`}
                          >
                            {actionType.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Đã cấp phép</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}

                  {apisOfSelectedRole.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                        Không tìm thấy API nào phù hợp với bộ lọc trong vai trò {selectedRole}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* TAB 4: NHẬT KÝ GỌI API (AUDIT LOGS)                             */
        /* ============================================================== */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between text-xs">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Nhật ký truy vấn thời gian thực (API Logs)</h3>
              <p className="text-[11px] text-slate-400">50 lượt gọi gần nhất qua API Gateway</p>
            </div>
            <button
              onClick={() => alert("Đang làm mới log...")}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-5 py-3">Thời gian</th>
                  <th className="px-5 py-3">Phương thức & Tuyến đường</th>
                  <th className="px-5 py-3">Client IP</th>
                  <th className="px-5 py-3">HTTP Status</th>
                  <th className="px-5 py-3 text-right">Độ trễ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-mono">
                {auditLogs.map((log, i) => (
                  <tr key={log.id ?? i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-slate-500">{log.createdAt || "—"}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-slate-800">{log.action || "—"}</span>
                      <p className="text-[10px] text-slate-400 mt-1">{log.details || "—"}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{log.ipAddress || "—"}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200">
                        User ID: {log.userId ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-slate-700">—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
