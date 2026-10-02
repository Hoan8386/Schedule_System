// =========================================================
// API Route - Ca làm việc theo ngày chi tiết (GET, PUT, DELETE)
// =========================================================

import { NextRequest } from 'next/server';
import { lichService } from '@/services/lich.service';
import { getAuthUser } from '@/middleware/auth.middleware';
import { checkPermission } from '@/middleware/rbac.middleware';
import { successResponse, handleApiError, parseBody } from '@/lib/utils';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/lich/:id', 'GET');

    const { id } = await context.params;
    const item = await lichService.getById(id);

    return successResponse(item, 'Lấy chi tiết ca làm việc thành công');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/lich/:id', 'PUT');

    const { id } = await context.params;
    const body = await parseBody(request);
    const item = await lichService.update(id, body, user);

    return successResponse(item, 'Cập nhật ca làm việc thành công');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/lich/:id', 'DELETE');

    const { id } = await context.params;
    await lichService.delete(id, user);

    return successResponse(null, 'Xóa ca làm việc thành công');
  } catch (error) {
    return handleApiError(error);
  }
}
