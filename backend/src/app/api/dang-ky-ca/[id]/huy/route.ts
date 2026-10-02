// =========================================================
// API Route - Hủy đăng ký ca
// =========================================================

import { NextRequest } from 'next/server';
import { dangKyCaService } from '@/services/dang-ky-ca.service';
import { getAuthUser } from '@/middleware/auth.middleware';
import { checkPermission } from '@/middleware/rbac.middleware';
import { successResponse, handleApiError } from '@/lib/utils';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/dang-ky-ca/:id/huy', 'PATCH');

    const { id } = await context.params;
    const result = await dangKyCaService.huy(id, user);

    return successResponse(result, 'Hủy đăng ký ca thành công');
  } catch (error) {
    return handleApiError(error);
  }
}
