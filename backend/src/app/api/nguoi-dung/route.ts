// =========================================================
// API Route - Người dùng (GET list, POST create)
// =========================================================

import { NextRequest } from 'next/server';
import { nguoiDungService } from '@/services/nguoi-dung.service';
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
    await checkPermission(user, '/api/nguoi-dung', 'GET');

    const searchParams = request.nextUrl.searchParams;
    const pagination = parsePaginationQuery(searchParams);
    const vaiTroId = searchParams.get('vaiTroId') || undefined;
    const trangThai = searchParams.get('trangThai') || undefined;

    const result = await nguoiDungService.getAll({
      ...pagination,
      vaiTroId,
      trangThai,
    });

    return successResponse(result.data, 'Lấy danh sách người dùng thành công', 200, result.meta);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/nguoi-dung', 'POST');

    const body = await parseBody(request);
    const nguoiDung = await nguoiDungService.create(body, user);

    return createdResponse(nguoiDung, 'Tạo người dùng thành công');
  } catch (error) {
    return handleApiError(error);
  }
}
