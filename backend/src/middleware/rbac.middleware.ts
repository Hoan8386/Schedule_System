// =========================================================
// RBAC Middleware - Kiểm tra phân quyền
// =========================================================

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { ForbiddenError } from '@/lib/errors';
import type { SessionUser } from '@/types';

/**
 * Kiểm tra quyền truy cập API dựa trên vai trò người dùng
 *
 * @param user - Session user đã xác thực
 * @param apiPath - Đường dẫn API (vd: /api/nguoi-dung)
 * @param httpMethod - Phương thức HTTP (vd: GET, POST)
 */
export async function checkPermission(
  user: SessionUser,
  apiPath: string,
  httpMethod: string
): Promise<void> {
  const vaiTroId = BigInt(user.vaiTroId);

  // Tìm quyền phù hợp với API path và method
  const permission = await prisma.vaiTroQuyen.findFirst({
    where: {
      vaiTroId: vaiTroId,
      quyen: {
        apiPath: apiPath,
        httpMethod: httpMethod.toUpperCase(),
        dangHoatDong: true,
      },
      vaiTro: {
        dangHoatDong: true,
      },
    },
    include: {
      quyen: true,
    },
  });

  if (!permission) {
    throw new ForbiddenError(
      `Bạn không có quyền ${httpMethod.toUpperCase()} ${apiPath}`
    );
  }
}

/**
 * Kiểm tra quyền với pattern matching cho dynamic routes
 * Ví dụ: /api/nguoi-dung/123 sẽ match với /api/nguoi-dung/:id
 *
 * @param user - Session user đã xác thực
 * @param requestPath - Đường dẫn thực tế (vd: /api/nguoi-dung/123)
 * @param httpMethod - Phương thức HTTP
 */
export async function checkPermissionWithPattern(
  user: SessionUser,
  requestPath: string,
  httpMethod: string
): Promise<void> {
  const vaiTroId = BigInt(user.vaiTroId);

  // Lấy tất cả quyền của vai trò
  const permissions = await prisma.vaiTroQuyen.findMany({
    where: {
      vaiTroId: vaiTroId,
      quyen: {
        httpMethod: httpMethod.toUpperCase(),
        dangHoatDong: true,
      },
      vaiTro: {
        dangHoatDong: true,
      },
    },
    include: {
      quyen: true,
    },
  });

  // Kiểm tra match pattern
  const hasPermission = permissions.some((p) =>
    matchApiPath(p.quyen.apiPath, requestPath)
  );

  if (!hasPermission) {
    throw new ForbiddenError(
      `Bạn không có quyền ${httpMethod.toUpperCase()} ${requestPath}`
    );
  }
}

/**
 * Match API path pattern với request path
 * Hỗ trợ dynamic segments: :id, :slug, etc.
 *
 * Ví dụ:
 * - /api/nguoi-dung/:id match /api/nguoi-dung/123
 * - /api/vai-tro/:id/quyen match /api/vai-tro/5/quyen
 */
function matchApiPath(pattern: string, path: string): boolean {
  // Exact match
  if (pattern === path) return true;

  const patternParts = pattern.split('/');
  const pathParts = path.split('/');

  if (patternParts.length !== pathParts.length) return false;

  return patternParts.every((part, index) => {
    if (part.startsWith(':')) return true; // Dynamic segment
    return part === pathParts[index];
  });
}

/**
 * Helper: Lấy API path chuẩn từ request
 * Loại bỏ query params và chuẩn hóa path
 */
export function extractApiPath(request: NextRequest): string {
  const url = new URL(request.url);
  return url.pathname;
}
