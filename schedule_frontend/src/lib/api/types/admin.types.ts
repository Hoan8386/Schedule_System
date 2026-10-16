/** Type – Quản trị hệ thống (tài khoản, phân quyền, thương hiệu, API, mã, thông báo) */

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

export interface OrganizationSettingResponse {
  id?: number;
  settingKey?: string;
  settingValue?: string;
  description?: string;
  [key: string]: unknown;
}

export interface StoreItemResponse {
  id?: number;
  storeId?: number;
  storeCode?: string;
  storeName?: string;
  address?: string;
  phone?: string;
  status?: string;
  [key: string]: unknown;
}

export interface AuditLogResponse {
  id?: number;
  action?: string;
  userId?: number;
  details?: string;
  ipAddress?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface VariableResponse {
  id?: number;
  variableKey?: string;
  variableValue?: string;
  description?: string;
  [key: string]: unknown;
}

export interface NotificationTemplateResponse {
  id?: number;
  templateCode?: string;
  templateName?: string;
  subject?: string;
  content?: string;
  status?: string;
  [key: string]: unknown;
}

export interface NotificationResponse {
  id?: number;
  userId?: number;
  title?: string;
  content?: string;
  status?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface SystemConfigResponse {
  configId?: number;
  id?: number;
  configKey?: string;
  configValue?: string;
  configType?: string;
  description?: string | null;
  updatedBy?: number | null;
  updatedAt?: string | null;
  [key: string]: unknown;
}

export interface NotificationTemplateVariableResponse {
  templateId?: number;
  variableId?: number;
  [key: string]: unknown;
}
