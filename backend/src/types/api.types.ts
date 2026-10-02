// =========================================================
// API Response Types - Chuẩn hóa response cho tất cả API
// =========================================================

/** Response thành công */
export interface ApiResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

/** Response lỗi */
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  code?: string;
}

/** Meta phân trang */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Query params cho phân trang */
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

/** Kết quả phân trang */
export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

/** Session user */
export interface SessionUser {
  id: string;
  maNguoiDung: string;
  hoTen: string;
  email: string;
  vaiTroId: string;
  maVaiTro: string;
  tenVaiTro: string;
}
