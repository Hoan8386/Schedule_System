// =========================================================
// API Route - Nhật ký hệ thống (Audit Log)
// =========================================================

import { NextRequest } from 'next/server';
import { nhatKyService } from '@/services/nhat-ky.service';
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
    await checkPermission(user, '/api/nhat-ky', 'GET');

    const searchParams = request.nextUrl.searchParams;
    const pagination = parsePaginationQuery(searchParams);
    const nguoiDungId = searchParams.get('nguoiDungId') || undefined;
    const hanhDong = searchParams.get('hanhDong') || undefined;
    const loaiDoiTuong = searchParams.get('loaiDoiTuong') || undefined;
    const tuNgay = searchParams.get('tuNgay') || undefined;
    const denNgay = searchParams.get('denNgay') || undefined;

    const result = await nhatKyService.getAll({
      ...pagination,
      nguoiDungId,
      hanhDong,
      loaiDoiTuong,
      tuNgay,
      denNgay,
    });

    return successResponse(result.data, 'Lấy nhật ký hệ thống thành công', 200, result.meta);
  } catch (error) {
    return handleApiError(error);
  }
}
