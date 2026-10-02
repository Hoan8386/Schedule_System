// =========================================================
// API Route - Cấu hình thông báo (GET list)
// =========================================================

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/middleware/auth.middleware';
import { checkPermission } from '@/middleware/rbac.middleware';
import { successResponse, handleApiError, serializeBigInt } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/cau-hinh-thong-bao', 'GET');

    const configs = await prisma.cauHinhThongBao.findMany({
      orderBy: [{ kenh: 'asc' }, { loaiSuKien: 'asc' }],
    });

    return successResponse(serializeBigInt(configs), 'Lấy cấu hình thông báo thành công');
  } catch (error) {
    return handleApiError(error);
  }
}
