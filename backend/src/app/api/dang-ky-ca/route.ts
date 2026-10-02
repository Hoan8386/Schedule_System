// =========================================================
// API Route - Đăng ký ca làm việc (GET list, POST create)
// =========================================================

import { NextRequest } from 'next/server';
import { dangKyCaService } from '@/services/dang-ky-ca.service';
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
    await checkPermission(user, '/api/dang-ky-ca', 'GET');

    const searchParams = request.nextUrl.searchParams;
    const pagination = parsePaginationQuery(searchParams);
    const nguoiDungId = searchParams.get('nguoiDungId') || undefined;
    const caLamViecTheoNgayId = searchParams.get('caLamViecTheoNgayId') || undefined;
    const kyDangKyLichId = searchParams.get('kyDangKyLichId') || undefined;
    const trangThai = searchParams.get('trangThai') || undefined;
    const tuNgay = searchParams.get('tuNgay') || undefined;
    const denNgay = searchParams.get('denNgay') || undefined;

    const result = await dangKyCaService.getAll(
      {
        ...pagination,
        nguoiDungId,
        caLamViecTheoNgayId,
        kyDangKyLichId,
        trangThai,
        tuNgay,
        denNgay,
      },
      user
    );

    return successResponse(result.data, 'Lấy danh sách đăng ký ca thành công', 200, result.meta);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/dang-ky-ca', 'POST');

    const body = await parseBody(request);
    const result = await dangKyCaService.dangKy(body, user);

    return createdResponse(result, 'Đăng ký ca làm việc thành công');
  } catch (error) {
    return handleApiError(error);
  }
}
