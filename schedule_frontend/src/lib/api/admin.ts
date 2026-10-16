import { API_BASE_URL, ACCESS_TOKEN_KEY, crud, http, request, type Body } from "./http";
import type {
  AuditLogResponse,
  NotificationResponse,
  NotificationTemplateResponse,
  NotificationTemplateVariableResponse,
  OrganizationSettingResponse,
  PermissionRequest,
  PermissionResponse,
  RolePermissionRequest,
  RolePermissionResponse,
  RoleRequest,
  RoleResponse,
  StoreItemResponse,
  SystemConfigResponse,
  UserRequest,
  UserResponse,
  UserRoleRequest,
  UserRoleResponse,
  VariableResponse,
} from "./types/admin.types";

const users = crud<UserResponse, UserRequest>("/api/v1/user");
const roles = crud<RoleResponse, RoleRequest>("/api/v1/role");
const permissions = crud<PermissionResponse, PermissionRequest>("/api/v1/permission");

/** DELETE có body (bảng liên kết khóa kép). */
const deleteWithBody = (path: string, body: unknown) => request<void>(path, { method: "DELETE", body: JSON.stringify(body) });

/** Tài khoản, vai trò, quyền và liên kết giữa chúng. */
export const adminUserApi = {
  getUsers: users.list,
  getUser: users.get,
  createUser: users.create,
  updateUser: users.update,
  deleteUser: users.remove,

  getRoles: roles.list,
  getRole: roles.get,
  createRole: roles.create,
  updateRole: roles.update,
  deleteRole: roles.remove,

  getPermissions: permissions.list,
  getPermission: permissions.get,
  createPermission: permissions.create,
  updatePermission: permissions.update,
  deletePermission: permissions.remove,

  getUserRoles: () => http.get<UserRoleResponse[]>("/api/v1/user_role"),
  assignRole: (body: UserRoleRequest) => http.post<UserRoleResponse>("/api/v1/user_role", body),
  updateUserRole: (body: UserRoleRequest) => http.put<UserRoleResponse>("/api/v1/user_role", body),
  removeRole: (body: { userId: number; roleId: number }) => deleteWithBody("/api/v1/user_role", body),

  getRolePermissions: () => http.get<RolePermissionResponse[]>("/api/v1/role_permission"),
  assignPermission: (body: RolePermissionRequest) => http.post<RolePermissionResponse>("/api/v1/role_permission", body),
  removePermission: (body: { roleId: number; permissionId: number }) => deleteWithBody("/api/v1/role_permission", body),
};

/** Thiết lập tổ chức / thương hiệu. */
export const adminBrandApi = {
  getSettings: () => http.get<OrganizationSettingResponse[]>("/api/v1/organization_setting"),
  updateSetting: (id: number, body: Body) => http.put<OrganizationSettingResponse>(`/api/v1/organization_setting/${id}`, body),
  createSetting: (body: Body) => http.post<OrganizationSettingResponse>("/api/v1/organization_setting", body),
  getStores: () => http.get<StoreItemResponse[]>("/api/v1/stores"),
  getSystemConfigs: () => http.get<SystemConfigResponse[]>("/api/v1/system_config"),
  saveSystemConfig: (id: number, body: Body) => http.put<SystemConfigResponse>(`/api/v1/system_config/${id}`, body),
};

/** Endpoint, nhật ký và tình trạng hệ thống. */
export const adminApiIntegration = {
  getEndpoints: () => http.get<PermissionResponse[]>("/api/v1/permission"),
  getAuditLogs: () => http.get<AuditLogResponse[]>("/api/v1/audit_log"),
  checkHealth: async () => {
    try {
      const token = typeof window === "undefined" ? null : localStorage.getItem(ACCESS_TOKEN_KEY);
      const res = await fetch(`${API_BASE_URL}/health`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      return { ok: res.ok, status: res.status };
    } catch {
      return { ok: false, status: 503 };
    }
  },
};

/** Cấu hình sinh mã tự động. */
export const adminCodeGenApi = {
  getSystemConfigs: () => http.get<SystemConfigResponse[]>("/api/v1/system_config"),
  updateSystemConfig: (id: number, body: Body) => http.put<SystemConfigResponse>(`/api/v1/system_config/${id}`, body),
  getVariables: () => http.get<VariableResponse[]>("/api/v1/variable"),
  saveVariable: (body: Body) => http.post<VariableResponse>("/api/v1/variable", body),
};

/** Mẫu thông báo và gửi thông báo. */
export const adminNotificationApi = {
  getTemplates: () => http.get<NotificationTemplateResponse[]>("/api/v1/notification_template"),
  updateTemplate: (id: number, body: Body) => http.put<NotificationTemplateResponse>(`/api/v1/notification_template/${id}`, body),
  getTemplateVariables: () => http.get<NotificationTemplateVariableResponse[]>("/api/v1/notification_template_variable"),
  getNotifications: () => http.get<NotificationResponse[]>("/api/v1/notification"),
  sendNotification: (body: Body) => http.post<NotificationResponse>("/api/v1/notification", body),
};
