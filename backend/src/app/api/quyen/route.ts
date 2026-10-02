// =========================================================
// API Route - Quyền (GET list, POST create)
// =========================================================

import { NextRequest } from 'next/server';
import { quyenService } from '@/services/quyen.service';
import { getAuthUser } from '@/middleware/auth.middleware';
import { checkPermission } from '@/middleware/rbac.middleware';
import {
  successResponse,
  createdResponse,
  handleApiError,
  parsePaginationQuery,
  parseBody,
} from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/quyen', 'GET');

    const query = parsePaginationQuery(request.nextUrl.searchParams);
    const result = await quyenService.getAll(query);

    return successResponse(result.data, 'Lấy danh sách quyền thành công', 200, result.meta);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/quyen', 'POST');

    const body = await parseBody(request);
    const quyen = await quyenService.create(body, user);

    return createdResponse(quyen, 'Tạo quyền thành công');
  } catch (error) {
    return handleApiError(error);
  }
}
