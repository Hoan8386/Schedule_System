// =========================================================
// API Route - Thông báo (GET list, PATCH mark all read)
// =========================================================

import { NextRequest } from 'next/server';
import { thongBaoService } from '@/services/thong-bao.service';
import { getAuthUser } from '@/middleware/auth.middleware';
import {
  successResponse,
  handleApiError,
  parsePaginationQuery,
} from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    const searchParams = request.nextUrl.searchParams;
    const pagination = parsePaginationQuery(searchParams);
    const daDoc = searchParams.get('daDoc') || undefined;

    const result = await thongBaoService.getMyNotifications(user.id, {
      ...pagination,
      daDoc,
    });

    return successResponse(
      { danhSach: result.data, soChuaDoc: result.soChuaDoc },
      'Lấy danh sách thông báo thành công',
      200,
      result.meta
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const result = await thongBaoService.danhDauTatCaDaDoc(user.id);
    return successResponse(result, 'Đã đánh dấu tất cả thông báo là đã đọc');
  } catch (error) {
    return handleApiError(error);
  }
}
