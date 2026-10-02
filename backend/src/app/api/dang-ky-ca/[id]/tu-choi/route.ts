// =========================================================
// API Route - Từ chối đăng ký ca
// =========================================================

import { NextRequest } from 'next/server';
import { dangKyCaService } from '@/services/dang-ky-ca.service';
import { getAuthUser } from '@/middleware/auth.middleware';
import { checkPermission } from '@/middleware/rbac.middleware';
import { successResponse, handleApiError, parseBody } from '@/lib/utils';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/dang-ky-ca/:id/tu-choi', 'PATCH');

    const { id } = await context.params;
    const body = await parseBody(request);
    const result = await dangKyCaService.tuChoi(id, body, user);

    return successResponse(result, 'Từ chối đăng ký ca thành công');
  } catch (error) {
    return handleApiError(error);
  }
}
