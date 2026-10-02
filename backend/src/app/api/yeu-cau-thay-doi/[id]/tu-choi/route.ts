// =========================================================
// API Route - Từ chối yêu cầu thay đổi lịch
// =========================================================

import { NextRequest } from 'next/server';
import { yeuCauThayDoiService } from '@/services/yeu-cau-thay-doi.service';
import { getAuthUser } from '@/middleware/auth.middleware';
import { checkPermission } from '@/middleware/rbac.middleware';
import { successResponse, handleApiError, parseBody } from '@/lib/utils';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/yeu-cau-thay-doi/:id/tu-choi', 'PATCH');

    const { id } = await context.params;
    const body = await parseBody(request);
    const result = await yeuCauThayDoiService.tuChoi(id, body, user);

    return successResponse(result, 'Từ chối yêu cầu thay đổi lịch thành công');
  } catch (error) {
    return handleApiError(error);
  }
}
