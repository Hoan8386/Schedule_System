// =========================================================
// API Route - Mẫu thông báo chi tiết (PUT)
// =========================================================

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/middleware/auth.middleware';
import { checkPermission } from '@/middleware/rbac.middleware';
import { successResponse, handleApiError, parseBody, serializeBigInt } from '@/lib/utils';
import { validate } from '@/middleware/validation.middleware';
import { capNhatMauThongBaoSchema } from '@/validators/thong-bao.validator';
import type { CapNhatMauThongBaoInput } from '@/validators/thong-bao.validator';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/mau-thong-bao/:id', 'PUT');

    const { id } = await context.params;
    const body = await parseBody(request);
    const validated = validate(capNhatMauThongBaoSchema, body) as CapNhatMauThongBaoInput;

    const updated = await prisma.mauThongBao.update({
      where: { id: BigInt(id) },
      data: {
        ...(validated.tieuDe !== undefined && { tieuDe: validated.tieuDe }),
        ...(validated.noiDung !== undefined && { noiDung: validated.noiDung }),
        ...(validated.dangHoatDong !== undefined && { dangHoatDong: validated.dangHoatDong }),
      },
    });

    return successResponse(serializeBigInt(updated), 'Cập nhật mẫu thông báo thành công');
  } catch (error) {
    return handleApiError(error);
  }
}
