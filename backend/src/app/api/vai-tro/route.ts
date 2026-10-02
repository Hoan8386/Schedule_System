// =========================================================
// API Route - Vai trò (GET list, POST create)
// =========================================================

import { NextRequest } from 'next/server';
import { vaiTroService } from '@/services/vai-tro.service';
import { getAuthUser } from '@/middleware/auth.middleware';
import { checkPermission } from '@/middleware/rbac.middleware';
import {
  successResponse,
  createdResponse,
  handleApiError,
  parsePaginationQuery,
  parseBody,
} from '@/lib/utils';

/**
 * GET /api/vai-tro
 * Lấy danh sách vai trò
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/vai-tro', 'GET');

    const query = parsePaginationQuery(request.nextUrl.searchParams);
    const result = await vaiTroService.getAll(query);

    return successResponse(result.data, 'Lấy danh sách vai trò thành công', 200, result.meta);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/vai-tro
 * Tạo vai trò mới
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/vai-tro', 'POST');

    const body = await parseBody(request);
    const vaiTro = await vaiTroService.create(body, user);

    return createdResponse(vaiTro, 'Tạo vai trò thành công');
  } catch (error) {
    return handleApiError(error);
  }
}
