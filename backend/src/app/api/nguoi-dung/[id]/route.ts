// =========================================================
// API Route - Người dùng chi tiết (GET, PUT, DELETE)
// =========================================================

import { NextRequest } from 'next/server';
import { nguoiDungService } from '@/services/nguoi-dung.service';
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
    await checkPermission(user, '/api/nguoi-dung/:id', 'GET');

    const { id } = await context.params;
    const nguoiDung = await nguoiDungService.getById(id);

    return successResponse(nguoiDung, 'Lấy chi tiết người dùng thành công');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/nguoi-dung/:id', 'PUT');

    const { id } = await context.params;
    const body = await parseBody(request);
    const nguoiDung = await nguoiDungService.update(id, body, user);

    return successResponse(nguoiDung, 'Cập nhật người dùng thành công');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/nguoi-dung/:id', 'DELETE');

    const { id } = await context.params;
    await nguoiDungService.delete(id, user);

    return successResponse(null, 'Xóa người dùng thành công');
  } catch (error) {
    return handleApiError(error);
  }
}
