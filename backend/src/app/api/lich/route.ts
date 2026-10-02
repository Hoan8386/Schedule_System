// =========================================================
// API Route - Lịch làm việc theo ngày (GET list, POST create)
// =========================================================

import { NextRequest } from 'next/server';
import { lichService } from '@/services/lich.service';
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
    await checkPermission(user, '/api/lich', 'GET');

    const searchParams = request.nextUrl.searchParams;
    const pagination = parsePaginationQuery(searchParams);
    const kyDangKyLichId = searchParams.get('kyDangKyLichId') || undefined;
    const caLamViecId = searchParams.get('caLamViecId') || undefined;
    const tuNgay = searchParams.get('tuNgay') || undefined;
    const denNgay = searchParams.get('denNgay') || undefined;
    const trangThai = searchParams.get('trangThai') || undefined;

    const result = await lichService.getAll({
      ...pagination,
      kyDangKyLichId,
      caLamViecId,
      tuNgay,
      denNgay,
      trangThai,
    });

    return successResponse(result.data, 'Lấy lịch làm việc thành công', 200, result.meta);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/lich', 'POST');

    const body = await parseBody(request);
    const ca = await lichService.create(body, user);

    return createdResponse(ca, 'Tạo ca làm việc theo ngày thành công');
  } catch (error) {
    return handleApiError(error);
  }
}
