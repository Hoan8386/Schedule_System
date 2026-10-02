// =========================================================
// API Route - Kỳ đăng ký chi tiết (GET, PUT, DELETE)
// =========================================================

import { NextRequest } from 'next/server';
import { kyDangKyService } from '@/services/ky-dang-ky.service';
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
    await checkPermission(user, '/api/ky-dang-ky/:id', 'GET');

    const { id } = await context.params;
    const ky = await kyDangKyService.getById(id);

    return successResponse(ky, 'Lấy chi tiết kỳ đăng ký thành công');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/ky-dang-ky/:id', 'PUT');

    const { id } = await context.params;
    const body = await parseBody(request);
    const ky = await kyDangKyService.update(id, body, user);

    return successResponse(ky, 'Cập nhật kỳ đăng ký thành công');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/ky-dang-ky/:id', 'DELETE');

    const { id } = await context.params;
    await kyDangKyService.delete(id, user);

    return successResponse(null, 'Xóa kỳ đăng ký thành công');
  } catch (error) {
    return handleApiError(error);
  }
}
