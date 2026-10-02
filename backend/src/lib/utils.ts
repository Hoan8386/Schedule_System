// =========================================================
// Utility Functions - Hàm tiện ích dùng chung
// =========================================================

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from './errors';
import type { ApiResponse, ApiErrorResponse, PaginationMeta, PaginationQuery } from '@/types';

// =========================================================
// Response Helpers
// =========================================================

/**
 * Trả response thành công
 */
export function successResponse<T>(
  data: T,
  message: string = 'Thành công',
  status: number = 200,
  meta?: PaginationMeta
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true as const,
      message,
      data,
      ...(meta && { meta }),
    },
    { status }
  );
}

/**
 * Trả response tạo mới thành công
 */
export function createdResponse<T>(
  data: T,
  message: string = 'Tạo thành công'
): NextResponse<ApiResponse<T>> {
  return successResponse(data, message, 201);
}

/**
 * Trả response lỗi
 */
export function errorResponse(
  message: string,
  status: number = 500,
  code?: string,
  errors?: Record<string, string[]>
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false as const,
      message,
      ...(code && { code }),
      ...(errors && { errors }),
    },
    { status }
  );
}

/**
 * Xử lý lỗi tập trung cho API route handlers
 */
export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  // Zod validation error
  if (error instanceof ZodError) {
    const formattedErrors: Record<string, string[]> = {};
    error.errors.forEach((err) => {
      const path = err.path.join('.');
      if (!formattedErrors[path]) {
        formattedErrors[path] = [];
      }
      formattedErrors[path].push(err.message);
    });

    return errorResponse(
      'Dữ liệu không hợp lệ',
      400,
      'VALIDATION_ERROR',
      formattedErrors
    );
  }

  // Custom App error
  if (error instanceof AppError) {
    return errorResponse(
      error.message,
      error.statusCode,
      error.code,
      error.errors
    );
  }

  // Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: { target?: string[] } };

    switch (prismaError.code) {
      case 'P2002': {
        const fields = prismaError.meta?.target?.join(', ') || 'unknown';
        return errorResponse(
          `Dữ liệu đã tồn tại: ${fields}`,
          409,
          'UNIQUE_CONSTRAINT'
        );
      }
      case 'P2003':
        return errorResponse(
          'Dữ liệu tham chiếu không tồn tại',
          400,
          'FOREIGN_KEY_CONSTRAINT'
        );
      case 'P2025':
        return errorResponse(
          'Không tìm thấy dữ liệu',
          404,
          'NOT_FOUND'
        );
    }
  }

  // Unknown error
  console.error('Unhandled error:', error);
  return errorResponse(
    'Đã xảy ra lỗi hệ thống',
    500,
    'INTERNAL_ERROR'
  );
}

// =========================================================
// Pagination Helpers
// =========================================================

/**
 * Parse query params cho phân trang
 */
export function parsePaginationQuery(
  searchParams: URLSearchParams
): PaginationQuery {
  return {
    page: Math.max(1, parseInt(searchParams.get('page') || '1', 10)),
    limit: Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10))),
    sortBy: searchParams.get('sortBy') || undefined,
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    search: searchParams.get('search') || undefined,
  };
}

/**
 * Tính meta phân trang
 */
export function calculatePaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Tính skip cho Prisma
 */
export function calculateSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}

// =========================================================
// Data Helpers
// =========================================================

/**
 * Chuyển BigInt thành string trong response
 * Prisma trả về BigInt cho các trường BIGSERIAL
 */
export function serializeBigInt<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

/**
 * Lấy IP từ request headers
 */
export function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  return realIp || null;
}

/**
 * Parse request body an toàn
 */
export async function parseBody<T>(request: Request): Promise<T> {
  try {
    return await request.json() as T;
  } catch {
    throw new AppError('Request body không hợp lệ', 400, 'INVALID_BODY');
  }
}
