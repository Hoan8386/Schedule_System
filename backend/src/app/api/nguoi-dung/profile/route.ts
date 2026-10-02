// =========================================================
// API Route - Thông tin cá nhân (Profile)
// =========================================================

import { NextRequest } from 'next/server';
import { nguoiDungService } from '@/services/nguoi-dung.service';
import { getAuthUser } from '@/middleware/auth.middleware';
import { successResponse, handleApiError, parseBody } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const profile = await nguoiDungService.getById(user.id);
    return successResponse(profile, 'Lấy thông tin cá nhân thành công');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const body = await parseBody(request);

    // Không cho phép tự đổi vai trò hay trạng thái
    delete (body as Record<string, unknown>).vaiTroId;
    delete (body as Record<string, unknown>).trangThai;

    const updated = await nguoiDungService.update(user.id, body, user);
    return successResponse(updated, 'Cập nhật thông tin cá nhân thành công');
  } catch (error) {
    return handleApiError(error);
  }
}
