// =========================================================
// API Route - Quyền chi tiết (GET, PUT, DELETE)
// =========================================================

import { NextRequest } from 'next/server';
import { quyenService } from '@/services/quyen.service';
import { getAuthUser } from '@/middleware/auth.middleware';
import { checkPermission } from '@/middleware/rbac.middleware';
import {
  successResponse,
  handleApiError,
  parseBody,
} from '@/lib/utils';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/quyen/:id', 'GET');

    const { id } = await context.params;
    const quyen = await quyenService.getById(id);

    return successResponse(quyen, 'Lấy chi tiết quyền thành công');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/quyen/:id', 'PUT');

    const { id } = await context.params;
    const body = await parseBody(request);
    const quyen = await quyenService.update(id, body, user);

    return successResponse(quyen, 'Cập nhật quyền thành công');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/quyen/:id', 'DELETE');

    const { id } = await context.params;
    await quyenService.delete(id, user);

    return successResponse(null, 'Xóa quyền thành công');
  } catch (error) {
    return handleApiError(error);
  }
}
