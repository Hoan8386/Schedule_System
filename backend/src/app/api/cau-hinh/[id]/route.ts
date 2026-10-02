// =========================================================
// API Route - Cấu hình hệ thống chi tiết (GET, PUT)
// =========================================================

import { NextRequest } from 'next/server';
import { cauHinhService } from '@/services/cau-hinh.service';
import { getAuthUser } from '@/middleware/auth.middleware';
import { checkPermission } from '@/middleware/rbac.middleware';
import { successResponse, handleApiError, parseBody } from '@/lib/utils';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/cau-hinh/:id', 'GET');

    const { id } = await context.params;
    const item = await cauHinhService.getById(id);

    return successResponse(item, 'Lấy chi tiết cấu hình thành công');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/cau-hinh/:id', 'PUT');

    const { id } = await context.params;
    const body = await parseBody(request);
    const item = await cauHinhService.update(id, body, user);

    return successResponse(item, 'Cập nhật cấu hình thành công');
  } catch (error) {
    return handleApiError(error);
  }
}
