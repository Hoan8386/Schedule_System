// =========================================================
// API Route - Quy tắc lịch chi tiết (GET, PUT, DELETE)
// =========================================================

import { NextRequest } from 'next/server';
import { quyTacLichService } from '@/services/quy-tac-lich.service';
import { getAuthUser } from '@/middleware/auth.middleware';
import { checkPermission } from '@/middleware/rbac.middleware';
import { successResponse, handleApiError, parseBody } from '@/lib/utils';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/quy-tac-lich/:id', 'GET');

    const { id } = await context.params;
    const item = await quyTacLichService.getById(id);

    return successResponse(item, 'Lấy chi tiết quy tắc lịch thành công');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/quy-tac-lich/:id', 'PUT');

    const { id } = await context.params;
    const body = await parseBody(request);
    const item = await quyTacLichService.update(id, body, user);

    return successResponse(item, 'Cập nhật quy tắc lịch thành công');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/quy-tac-lich/:id', 'DELETE');

    const { id } = await context.params;
    await quyTacLichService.delete(id, user);

    return successResponse(null, 'Xóa quy tắc lịch thành công');
  } catch (error) {
    return handleApiError(error);
  }
}
