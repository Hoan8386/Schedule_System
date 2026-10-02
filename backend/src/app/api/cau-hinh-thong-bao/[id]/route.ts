// =========================================================
// API Route - Cấu hình thông báo chi tiết (PUT)
// =========================================================

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/middleware/auth.middleware';
import { checkPermission } from '@/middleware/rbac.middleware';
import { successResponse, handleApiError, parseBody, serializeBigInt } from '@/lib/utils';
import { validate } from '@/middleware/validation.middleware';
import { capNhatCauHinhThongBaoSchema } from '@/validators/thong-bao.validator';
import type { CapNhatCauHinhThongBaoInput } from '@/validators/thong-bao.validator';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/cau-hinh-thong-bao/:id', 'PUT');

    const { id } = await context.params;
    const body = await parseBody(request);
    const validated = validate(capNhatCauHinhThongBaoSchema, body) as CapNhatCauHinhThongBaoInput;

    const updated = await prisma.cauHinhThongBao.update({
      where: { id: BigInt(id) },
      data: { bat: validated.bat },
    });

    return successResponse(serializeBigInt(updated), 'Cập nhật cấu hình thông báo thành công');
  } catch (error) {
    return handleApiError(error);
  }
}
