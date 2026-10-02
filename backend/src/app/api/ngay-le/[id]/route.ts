// =========================================================
// API Route - Ngày lễ chi tiết (GET, PUT, DELETE)
// =========================================================

import { NextRequest } from 'next/server';
import { ngayLeService } from '@/services/ngay-le.service';
import { getAuthUser } from '@/middleware/auth.middleware';
import { checkPermission } from '@/middleware/rbac.middleware';
import { successResponse, handleApiError, parseBody } from '@/lib/utils';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/ngay-le/:id', 'GET');

    const { id } = await context.params;
    const item = await ngayLeService.getById(id);

    return successResponse(item, 'Lấy chi tiết ngày lễ thành công');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/ngay-le/:id', 'PUT');

    const { id } = await context.params;
    const body = await parseBody(request);
    const item = await ngayLeService.update(id, body, user);

    return successResponse(item, 'Cập nhật ngày lễ thành công');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/ngay-le/:id', 'DELETE');

    const { id } = await context.params;
    await ngayLeService.delete(id, user);

    return successResponse(null, 'Xóa ngày lễ thành công');
  } catch (error) {
    return handleApiError(error);
  }
}
