// =========================================================
// API Route - Ca làm việc chi tiết (GET, PUT, DELETE)
// =========================================================

import { NextRequest } from 'next/server';
import { caLamViecService } from '@/services/ca-lam-viec.service';
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
    await checkPermission(user, '/api/ca-lam-viec/:id', 'GET');

    const { id } = await context.params;
    const ca = await caLamViecService.getById(id);

    return successResponse(ca, 'Lấy chi tiết ca làm việc thành công');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/ca-lam-viec/:id', 'PUT');

    const { id } = await context.params;
    const body = await parseBody(request);
    const ca = await caLamViecService.update(id, body, user);

    return successResponse(ca, 'Cập nhật ca làm việc thành công');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/ca-lam-viec/:id', 'DELETE');

    const { id } = await context.params;
    await caLamViecService.delete(id, user);

    return successResponse(null, 'Xóa ca làm việc thành công');
  } catch (error) {
    return handleApiError(error);
  }
}
