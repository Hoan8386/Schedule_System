/**
 * Admin API Client & Interfaces
 * Đọc và map chuẩn từ tài liệu API_RESPONSE_DATA.md và backend Spring Boot
 */

import { ApiResponse } from "@/lib/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function getHeaders(): Headers {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("bloan_access_token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }
  return headers;
}

async function requestApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = getHeaders();

  if (options.headers) {
    new Headers(options.headers).forEach((v, k) => headers.set(k, v));
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (res.status === 204) {
    return {
      statusCode: 204,
      error: null,
      message: "Thao tác thành công",
      data: null as unknown as T,
    };
  }

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // Non JSON
  }

  if (!res.ok) {
    const errorMsg =
      (json && (Array.isArray(json.message) ? json.message.join(", ") : json.message)) ||
      json?.error ||
      text ||
      `Lỗi kết nối API (${res.status})`;
    throw new Error(errorMsg);
  }

  return {
    statusCode: res.status,
    error: json?.error ?? null,
    message: json?.message ?? "Call API Success",
    data: (json && "data" in json ? json.data : json) as T,
  };
}

// ==========================================
// 1. QUẢN LÝ TÀI KHOẢN (USER / ROLE / PERMISSION)
// ==========================================

export interface UserResponse {
  id: number;
  username: string;
  email: string | null;
  phone: string | null;
  status: string;
  lastLoginAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface UserRequest {
  username?: string;
  passwordHash?: string;
  email?: string;
  phone?: string;
  status?: string;
}

export interface RoleResponse {
  roleId: number; // Chú ý: roleId không phải id
  roleCode: string;
  roleName: string;
  description: string | null;
  status: string | null;
}

export interface RoleRequest {
  roleCode: string;
  roleName: string;
  description?: string;
  status?: string;
}

export interface PermissionResponse {
  permissionId: number; // Chú ý: permissionId không phải id
  permissionCode: string;
  permissionName: string;
  description: string | null;
  apiPath: string | null;
  method: string | null;
}

export interface PermissionRequest {
  permissionCode: string;
  permissionName: string;
  description?: string;
  apiPath?: string;
  method?: string;
}

export interface UserRoleResponse {
  userId: number;
  roleId: number;
  assignedBy: number | null;
  assignedAt: string | null;
}

export interface UserRoleRequest {
  userId: number;
  roleId: number;
  assignedBy?: number;
  assignedAt?: string;
}

export interface RolePermissionResponse {
  roleId: number;
  permissionId: number;
}

export interface RolePermissionRequest {
  roleId: number;
  permissionId: number;
}

export const adminUserApi = {
  // USER
  getUsers: () => requestApi<UserResponse[]>("/api/v1/user"),
  getUser: (id: number) => requestApi<UserResponse>(`/api/v1/user/${id}`),
  createUser: (body: UserRequest) =>
    requestApi<UserResponse>("/api/v1/user", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateUser: (id: number, body: UserRequest) =>
    requestApi<UserResponse>(`/api/v1/user/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  deleteUser: (id: number) =>
    requestApi<void>(`/api/v1/user/${id}`, {
      method: "DELETE",
    }),

  // ROLE
  getRoles: () => requestApi<RoleResponse[]>("/api/v1/role"),
  getRole: (id: number) => requestApi<RoleResponse>(`/api/v1/role/${id}`),
  createRole: (body: RoleRequest) =>
    requestApi<RoleResponse>("/api/v1/role", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateRole: (id: number, body: RoleRequest) =>
    requestApi<RoleResponse>(`/api/v1/role/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  deleteRole: (id: number) =>
    requestApi<void>(`/api/v1/role/${id}`, {
      method: "DELETE",
    }),

  // PERMISSION
  getPermissions: () => requestApi<PermissionResponse[]>("/api/v1/permission"),
  getPermission: (id: number) =>
    requestApi<PermissionResponse>(`/api/v1/permission/${id}`),
  createPermission: (body: PermissionRequest) =>
    requestApi<PermissionResponse>("/api/v1/permission", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updatePermission: (id: number, body: PermissionRequest) =>
    requestApi<PermissionResponse>(`/api/v1/permission/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  deletePermission: (id: number) =>
    requestApi<void>(`/api/v1/permission/${id}`, {
      method: "DELETE",
    }),

  // USER_ROLE
  getUserRoles: () => requestApi<UserRoleResponse[]>("/api/v1/user_role"),
  assignRole: (body: UserRoleRequest) =>
    requestApi<UserRoleResponse>("/api/v1/user_role", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateUserRole: (body: UserRoleRequest) =>
    requestApi<UserRoleResponse>("/api/v1/user_role", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  removeRole: (body: { userId: number; roleId: number }) =>
    requestApi<void>("/api/v1/user_role", {
      method: "DELETE",
      body: JSON.stringify(body),
    }),

  // ROLE_PERMISSION
  getRolePermissions: () =>
    requestApi<RolePermissionResponse[]>("/api/v1/role_permission"),
  assignPermission: (body: RolePermissionRequest) =>
    requestApi<RolePermissionResponse>("/api/v1/role_permission", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  removePermission: (body: { roleId: number; permissionId: number }) =>
    requestApi<void>("/api/v1/role_permission", {
      method: "DELETE",
      body: JSON.stringify(body),
    }),
};

// ==========================================
// 2. QUẢN LÝ THÔNG TIN CỬA HÀNG (LOGO, MÀU SẮC)
// ==========================================

export interface OrganizationSettingResponse {
  id?: number;
  settingKey?: string;
  settingValue?: string;
  description?: string;
  [key: string]: any;
}

export interface StoreItemResponse {
  id?: number;
  storeId?: number;
  storeCode?: string;
  storeName?: string;
  address?: string;
  phone?: string;
  status?: string;
  [key: string]: any;
}

export const adminBrandApi = {
  getSettings: () =>
    requestApi<OrganizationSettingResponse[]>("/api/v1/organization_setting"),
  updateSetting: (id: number, body: any) =>
    requestApi<OrganizationSettingResponse>(`/api/v1/organization_setting/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  createSetting: (body: any) =>
    requestApi<OrganizationSettingResponse>("/api/v1/organization_setting", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getStores: () => requestApi<StoreItemResponse[]>("/api/v1/stores"),
  getSystemConfigs: () => requestApi<any[]>("/api/v1/system_config"),
  saveSystemConfig: (id: number, body: any) =>
    requestApi<any>(`/api/v1/system_config/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
};

// ==========================================
// 3. QUẢN LÝ API & KIỂM TRA HỆ THỐNG
// ==========================================

export interface AuditLogResponse {
  id?: number;
  action?: string;
  userId?: number;
  details?: string;
  ipAddress?: string;
  createdAt?: string;
  [key: string]: any;
}

export const adminApiIntegration = {
  getEndpoints: () =>
    requestApi<PermissionResponse[]>("/api/v1/permission"),
  getAuditLogs: () =>
    requestApi<AuditLogResponse[]>("/api/v1/audit_log"),
  checkHealth: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, {
        headers: getHeaders(),
      });
      return { ok: res.ok, status: res.status };
    } catch {
      return { ok: false, status: 503 };
    }
  },
};

// ==========================================
// 4. CẤU HÌNH SINH MÃ TỰ ĐỘNG
// ==========================================

export interface VariableResponse {
  id?: number;
  variableKey?: string;
  variableValue?: string;
  description?: string;
  [key: string]: any;
}

export const adminCodeGenApi = {
  getSystemConfigs: () => requestApi<any[]>("/api/v1/system_config"),
  updateSystemConfig: (id: number, body: any) =>
    requestApi<any>(`/api/v1/system_config/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  getVariables: () => requestApi<VariableResponse[]>("/api/v1/variable"),
  saveVariable: (body: any) =>
    requestApi<VariableResponse>("/api/v1/variable", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

// ==========================================
// 5. QUẢN LÝ THÔNG BÁO & EMAIL
// ==========================================

export interface NotificationTemplateResponse {
  id?: number;
  templateCode?: string;
  templateName?: string;
  subject?: string;
  content?: string;
  status?: string;
  [key: string]: any;
}

export interface NotificationResponse {
  id?: number;
  userId?: number;
  title?: string;
  content?: string;
  status?: string;
  createdAt?: string;
  [key: string]: any;
}

export const adminNotificationApi = {
  getTemplates: () =>
    requestApi<NotificationTemplateResponse[]>("/api/v1/notification_template"),
  updateTemplate: (id: number, body: any) =>
    requestApi<NotificationTemplateResponse>(
      `/api/v1/notification_template/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(body),
      }
    ),
  getTemplateVariables: () =>
    requestApi<any[]>("/api/v1/notification_template_variable"),
  getNotifications: () =>
    requestApi<NotificationResponse[]>("/api/v1/notification"),
  sendNotification: (body: any) =>
    requestApi<NotificationResponse>("/api/v1/notification", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
