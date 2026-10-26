/** Type – Nhân sự & cửa hàng */

export interface EmployeeResponse {
  id: number;
  userId?: number | null;
  employeeCode?: string | null;
  fullName?: string | null;
  avatar?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  hireDate?: string | null;
  status?: string | null;
  note?: string | null;
  idCardFrontId?: number | null;
  idCardBackId?: number | null;
  /** Ảnh chữ ký (id tệp đính kèm) */
  signatureId?: number | null;
  /** Vị trí theo vai trò tài khoản: EMPLOYEE / STORE_MANAGER */
  position?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  [key: string]: unknown;
}

export interface EmployeeRequest {
  userId?: number;
  /** Chỉ đọc – backend tự sinh khi tạo */
  employeeCode?: string;
  fullName: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: string;
  email?: string;
  phone?: string;
  address?: string;
  idCardFrontId?: number | null;
  idCardBackId?: number | null;
  signatureId?: number | null;
  hireDate?: string;
  status: string;
  note?: string;
  /** EMPLOYEE / STORE_MANAGER – quyền tài khoản theo vị trí */
  position?: string;
  /** Cửa hàng phân bổ (bỏ trống = không đổi) */
  storeIds?: number[];
  primaryStoreId?: number | null;
  storeStartDate?: string | null;
}

/** PUT /api/v1/stores/{id}/staff – managerEmployeeId: null = giữ nguyên, 0 = bỏ trống */
export interface StoreStaffRequest {
  managerEmployeeId?: number | null;
  members: { employeeId: number; position?: string | null }[];
  removals: { employeeId: number; transferToStoreId?: number | null }[];
}

export interface StoreResponse {
  id: number;
  storeCode?: string | null;
  storeName?: string | null;
  storeImageId?: number | null;
  logoId?: number | null;
  logoImage?: string | null;
  logoContentType?: string | null;
  address?: string | null;
  phone?: string | null;
  status?: string | null;
  note?: string | null;
  [key: string]: unknown;
}

export interface StoreRequest {
  storeCode: string;
  storeName: string;
  storeImageId?: number;
  logoId?: number;
  address?: string;
  phone?: string;
  status: string;
  note?: string;
}

export interface EmployeeStoreResponse {
  employeeStoreId: number;
  employeeId: number;
  storeId: number;
  startDate?: string | null;
  endDate?: string | null;
  isPrimary?: boolean | null;
  status?: string | null;
  [key: string]: unknown;
}

export interface StoreManagerResponse {
  storeManagerId: number;
  storeId: number;
  employeeId: number;
  status?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  [key: string]: unknown;
}

export interface AttachmentResponse {
  attachmentId: number;
  fileName?: string;
  filePath?: string;
  fileType?: string;
  fileSize?: number;
  url?: string;
}
