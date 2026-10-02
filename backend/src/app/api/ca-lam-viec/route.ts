// =========================================================
// API Route - Ca làm việc (GET list, POST create)
// =========================================================

import { NextRequest } from 'next/server';
import { caLamViecService } from '@/services/ca-lam-viec.service';
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
    await checkPermission(user, '/api/ca-lam-viec', 'GET');

    const searchParams = request.nextUrl.searchParams;
    const pagination = parsePaginationQuery(searchParams);
    const trangThai = searchParams.get('trangThai') || undefined;

    const result = await caLamViecService.getAll({
      ...pagination,
      trangThai,
    });

    return successResponse(result.data, 'Lấy danh sách ca làm việc thành công', 200, result.meta);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/ca-lam-viec', 'POST');

    const body = await parseBody(request);
    const ca = await caLamViecService.create(body, user);

    return createdResponse(ca, 'Tạo ca làm việc thành công');
  } catch (error) {
    return handleApiError(error);
  }
}
