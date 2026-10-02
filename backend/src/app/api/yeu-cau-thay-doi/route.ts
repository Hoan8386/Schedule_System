// =========================================================
// API Route - Yêu cầu thay đổi lịch (GET list, POST create)
// =========================================================

import { NextRequest } from 'next/server';
import { yeuCauThayDoiService } from '@/services/yeu-cau-thay-doi.service';
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
    await checkPermission(user, '/api/yeu-cau-thay-doi', 'GET');

    const searchParams = request.nextUrl.searchParams;
    const pagination = parsePaginationQuery(searchParams);
    const nguoiDungId = searchParams.get('nguoiDungId') || undefined;
    const loaiYeuCau = searchParams.get('loaiYeuCau') || undefined;
    const trangThai = searchParams.get('trangThai') || undefined;

    const result = await yeuCauThayDoiService.getAll(
      {
        ...pagination,
        nguoiDungId,
        loaiYeuCau,
        trangThai,
      },
      user
    );

    return successResponse(result.data, 'Lấy danh sách yêu cầu thay đổi thành công', 200, result.meta);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/yeu-cau-thay-doi', 'POST');

    const body = await parseBody(request);
    const result = await yeuCauThayDoiService.create(body, user);

    return createdResponse(result, 'Gửi yêu cầu thay đổi lịch thành công');
  } catch (error) {
    return handleApiError(error);
  }
}
