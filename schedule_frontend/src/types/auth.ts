export type UserRoleCode = "ADMIN" | "MANAGER" | "STORE_MANAGER" | "EMPLOYEE";

export interface UserRoleInfo {
  id: number;
  roleCode: UserRoleCode;
  roleName: string;
  description: string;
  status: string;
}

export interface UserLogin {
  id: number;
  username: string;
  email: string;
  phone?: string | null;
  status?: string;
  role?: UserRoleCode;
  roleId?: number;
  roleName?: string;
  storeName?: string;
  storeCode?: string;
  fullName?: string;
}

export interface ResLoginDTO {
  access_token: string;
  refresh_token: string;
  user: UserLogin;
}

export interface RestResponse<T = unknown> {
  statusCode: number;
  error?: string | null;
  message?: string | string[];
  data: T;
}

export interface AuthLoginRequest {
  username?: string;
  email?: string;
  identifier?: string;
  password: string;
}

export interface AuthRegisterRequest {
  username: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

export interface AuthTokenResponse {
  message: string;
  token?: string;
}

export interface AuthConfirmRequest {
  token: string;
}

export interface AuthForgotPasswordRequest {
  email: string;
}

export interface AuthResetPasswordRequest {
  email?: string;
  token: string;
  password: string;
  confirmPassword: string;
}
