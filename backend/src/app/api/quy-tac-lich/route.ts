// =========================================================
// API Route - Quy tắc lịch (GET list, POST create)
// =========================================================

import { NextRequest } from 'next/server';
import { quyTacLichService } from '@/services/quy-tac-lich.service';
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
    await checkPermission(user, '/api/quy-tac-lich', 'GET');

    const searchParams = request.nextUrl.searchParams;
    const pagination = parsePaginationQuery(searchParams);
    const kyDangKyLichId = searchParams.get('kyDangKyLichId') || undefined;

    const result = await quyTacLichService.getAll({
      ...pagination,
      kyDangKyLichId,
    });

    return successResponse(result.data, 'Lấy danh sách quy tắc lịch thành công', 200, result.meta);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/quy-tac-lich', 'POST');

    const body = await parseBody(request);
    const item = await quyTacLichService.create(body, user);

    return createdResponse(item, 'Tạo quy tắc lịch thành công');
  } catch (error) {
    return handleApiError(error);
  }
}
