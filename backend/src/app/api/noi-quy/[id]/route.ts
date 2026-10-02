// =========================================================
// API Route - Nội quy lịch chi tiết (GET, PUT, DELETE)
// =========================================================

import { NextRequest } from 'next/server';
import { noiQuyService } from '@/services/noi-quy.service';
import { getAuthUser } from '@/middleware/auth.middleware';
import { checkPermission } from '@/middleware/rbac.middleware';
import { successResponse, handleApiError, parseBody } from '@/lib/utils';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/noi-quy/:id', 'GET');

    const { id } = await context.params;
    const item = await noiQuyService.getById(id);

    return successResponse(item, 'Lấy chi tiết nội quy thành công');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/noi-quy/:id', 'PUT');

    const { id } = await context.params;
    const body = await parseBody(request);
    const item = await noiQuyService.update(id, body, user);

    return successResponse(item, 'Cập nhật nội quy thành công');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/noi-quy/:id', 'DELETE');

    const { id } = await context.params;
    await noiQuyService.delete(id, user);

    return successResponse(null, 'Xóa nội quy thành công');
  } catch (error) {
    return handleApiError(error);
  }
}
