// =========================================================
// API Route - Mẫu thông báo (GET list, POST create)
// =========================================================

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/middleware/auth.middleware';
import { checkPermission } from '@/middleware/rbac.middleware';
import { successResponse, createdResponse, handleApiError, parseBody, serializeBigInt } from '@/lib/utils';
import { validate } from '@/middleware/validation.middleware';
import { taoMauThongBaoSchema } from '@/validators/thong-bao.validator';
import type { TaoMauThongBaoInput } from '@/validators/thong-bao.validator';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/mau-thong-bao', 'GET');

    const templates = await prisma.mauThongBao.findMany({
      orderBy: [{ kenh: 'asc' }, { loaiSuKien: 'asc' }],
    });

    return successResponse(serializeBigInt(templates), 'Lấy danh sách mẫu thông báo thành công');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/mau-thong-bao', 'POST');

    const body = await parseBody(request);
    const validated = validate(taoMauThongBaoSchema, body) as TaoMauThongBaoInput;

    const item = await prisma.mauThongBao.create({
      data: {
        kenh: validated.kenh,
        loaiSuKien: validated.loaiSuKien,
        tieuDe: validated.tieuDe,
        noiDung: validated.noiDung,
        dangHoatDong: validated.dangHoatDong ?? true,
      },
    });

    return createdResponse(serializeBigInt(item), 'Tạo mẫu thông báo thành công');
  } catch (error) {
    return handleApiError(error);
  }
}
