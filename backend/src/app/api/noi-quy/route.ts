// =========================================================
// API Route - Nội quy lịch (GET list, POST create)
// =========================================================

import { NextRequest } from 'next/server';
import { noiQuyService } from '@/services/noi-quy.service';
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
    await checkPermission(user, '/api/noi-quy', 'GET');

    const searchParams = request.nextUrl.searchParams;
    const pagination = parsePaginationQuery(searchParams);
    const kyDangKyLichId = searchParams.get('kyDangKyLichId') || undefined;
    const trangThai = searchParams.get('trangThai') || undefined;

    const result = await noiQuyService.getAll({
      ...pagination,
      kyDangKyLichId,
      trangThai,
    });

    return successResponse(result.data, 'Lấy danh sách nội quy thành công', 200, result.meta);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/noi-quy', 'POST');

    const body = await parseBody(request);
    const item = await noiQuyService.create(body, user);

    return createdResponse(item, 'Tạo nội quy thành công');
  } catch (error) {
    return handleApiError(error);
  }
}
