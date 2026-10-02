// =========================================================
// API Route - Yêu cầu thay đổi chi tiết
// =========================================================

import { NextRequest } from 'next/server';
import { yeuCauThayDoiService } from '@/services/yeu-cau-thay-doi.service';
import { getAuthUser } from '@/middleware/auth.middleware';
import { checkPermission } from '@/middleware/rbac.middleware';
import { successResponse, handleApiError } from '@/lib/utils';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/yeu-cau-thay-doi/:id', 'GET');

    const { id } = await context.params;
    const item = await yeuCauThayDoiService.getById(id, user);

    return successResponse(item, 'Lấy chi tiết yêu cầu thay đổi thành công');
  } catch (error) {
    return handleApiError(error);
  }
}
