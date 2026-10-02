// =========================================================
// API Route - Vai trò chi tiết (GET, PUT, DELETE)
// =========================================================

import { NextRequest } from 'next/server';
import { vaiTroService } from '@/services/vai-tro.service';
import { getAuthUser } from '@/middleware/auth.middleware';
import { checkPermissionWithPattern } from '@/middleware/rbac.middleware';
import {
  successResponse,
  handleApiError,
  parseBody,
} from '@/lib/utils';

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/vai-tro/:id
 * Lấy chi tiết vai trò
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const user = await getAuthUser(request);
    await checkPermissionWithPattern(user, '/api/vai-tro/' + (await params).id, 'GET');

    const { id } = await params;
    const vaiTro = await vaiTroService.getById(id);

    return successResponse(vaiTro, 'Lấy chi tiết vai trò thành công');
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/vai-tro/:id
 * Cập nhật vai trò
 */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const user = await getAuthUser(request);
    await checkPermissionWithPattern(user, '/api/vai-tro/' + (await params).id, 'PUT');

    const { id } = await params;
    const body = await parseBody(request);
    const vaiTro = await vaiTroService.update(id, body, user);

    return successResponse(vaiTro, 'Cập nhật vai trò thành công');
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/vai-tro/:id
 * Xóa vai trò
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const user = await getAuthUser(request);
    await checkPermissionWithPattern(user, '/api/vai-tro/' + (await params).id, 'DELETE');

    const { id } = await params;
    await vaiTroService.delete(id, user);

    return successResponse(null, 'Xóa vai trò thành công');
  } catch (error) {
    return handleApiError(error);
  }
}
