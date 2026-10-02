// =========================================================
// API Route - Ngày lễ (GET list, POST create)
// =========================================================

import { NextRequest } from 'next/server';
import { ngayLeService } from '@/services/ngay-le.service';
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
    await checkPermission(user, '/api/ngay-le', 'GET');

    const searchParams = request.nextUrl.searchParams;
    const pagination = parsePaginationQuery(searchParams);
    const tuNgay = searchParams.get('tuNgay') || undefined;
    const denNgay = searchParams.get('denNgay') || undefined;

    const result = await ngayLeService.getAll({
      ...pagination,
      tuNgay,
      denNgay,
    });

    return successResponse(result.data, 'Lấy danh sách ngày lễ thành công', 200, result.meta);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/ngay-le', 'POST');

    const body = await parseBody(request);
    const item = await ngayLeService.create(body, user);

    return createdResponse(item, 'Tạo ngày lễ thành công');
  } catch (error) {
    return handleApiError(error);
  }
}
