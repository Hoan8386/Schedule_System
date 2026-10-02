// =========================================================
// API Route - Gán quyền cho vai trò
// =========================================================

import { NextRequest } from 'next/server';
import { vaiTroService } from '@/services/vai-tro.service';
import { getAuthUser } from '@/middleware/auth.middleware';
import { checkPermissionWithPattern } from '@/middleware/rbac.middleware';
import { successResponse, handleApiError, parseBody } from '@/lib/utils';

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/vai-tro/:id/quyen
 * Gán quyền cho vai trò
 */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const user = await getAuthUser(request);
    await checkPermissionWithPattern(user, '/api/vai-tro/' + (await params).id, 'PUT');

    const { id } = await params;
    const body = await parseBody(request);
    const result = await vaiTroService.ganQuyen(id, body, user);

    return successResponse(result, 'Gán quyền cho vai trò thành công');
  } catch (error) {
    return handleApiError(error);
  }
}
