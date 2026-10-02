// =========================================================
// API Route - Đánh dấu thông báo đã đọc
// =========================================================

import { NextRequest } from 'next/server';
import { thongBaoService } from '@/services/thong-bao.service';
import { getAuthUser } from '@/middleware/auth.middleware';
import { successResponse, handleApiError } from '@/lib/utils';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    const { id } = await context.params;

    const updated = await thongBaoService.danhDauDaDoc(id, user.id);
    return successResponse(updated, 'Đánh dấu thông báo đã đọc thành công');
  } catch (error) {
    return handleApiError(error);
  }
}
