// =========================================================
// API Route - Kỳ đăng ký (GET list, POST create)
// =========================================================

import { NextRequest } from 'next/server';
import { kyDangKyService } from '@/services/ky-dang-ky.service';
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
    await checkPermission(user, '/api/ky-dang-ky', 'GET');

    const searchParams = request.nextUrl.searchParams;
    const pagination = parsePaginationQuery(searchParams);
    const nam = searchParams.get('nam') || undefined;
    const thang = searchParams.get('thang') || undefined;
    const trangThai = searchParams.get('trangThai') || undefined;

    const result = await kyDangKyService.getAll({
      ...pagination,
      nam,
      thang,
      trangThai,
    });

    return successResponse(result.data, 'Lấy danh sách kỳ đăng ký thành công', 200, result.meta);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/ky-dang-ky', 'POST');

    const body = await parseBody(request);
    const ky = await kyDangKyService.create(body, user);

    return createdResponse(ky, 'Tạo kỳ đăng ký thành công');
  } catch (error) {
    return handleApiError(error);
  }
}
