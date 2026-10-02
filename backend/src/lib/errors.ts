// =========================================================
// Custom Error Classes - Xử lý lỗi tập trung
// =========================================================

/**
 * Base error class cho hệ thống
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly errors?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
  }
}

/**
 * 400 Bad Request - Dữ liệu không hợp lệ
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Dữ liệu không hợp lệ', errors?: Record<string, string[]>) {
    super(message, 400, 'BAD_REQUEST', errors);
    this.name = 'BadRequestError';
  }
}

/**
 * 401 Unauthorized - Chưa đăng nhập
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Chưa đăng nhập hoặc phiên đăng nhập đã hết hạn') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

/**
 * 403 Forbidden - Không có quyền
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Bạn không có quyền thực hiện thao tác này') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

/**
 * 404 Not Found - Không tìm thấy
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Không tìm thấy dữ liệu') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

/**
 * 409 Conflict - Dữ liệu xung đột
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Dữ liệu bị trùng hoặc xung đột') {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

/**
 * 422 Unprocessable Entity - Lỗi nghiệp vụ
 */
export class BusinessError extends AppError {
  constructor(message: string, code: string = 'BUSINESS_ERROR') {
    super(message, 422, code);
    this.name = 'BusinessError';
  }
}
