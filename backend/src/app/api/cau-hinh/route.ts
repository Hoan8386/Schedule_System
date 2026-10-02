// =========================================================
// API Route - Cấu hình hệ thống (GET list)
// =========================================================

import { NextRequest } from 'next/server';
import { cauHinhService } from '@/services/cau-hinh.service';
import { getAuthUser } from '@/middleware/auth.middleware';
import { checkPermission } from '@/middleware/rbac.middleware';
import {
  successResponse,
  handleApiError,
  parsePaginationQuery,
} from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/cau-hinh', 'GET');

    const pagination = parsePaginationQuery(request.nextUrl.searchParams);
    const result = await cauHinhService.getAll(pagination);

    return successResponse(result.data, 'Lấy danh sách cấu hình thành công', 200, result.meta);
  } catch (error) {
    return handleApiError(error);
  }
}
