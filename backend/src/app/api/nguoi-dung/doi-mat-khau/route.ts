// =========================================================
// API Route - Đổi mật khẩu
// =========================================================

import { NextRequest } from 'next/server';
import { nguoiDungService } from '@/services/nguoi-dung.service';
import { getAuthUser } from '@/middleware/auth.middleware';
import { successResponse, handleApiError, parseBody } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const body = await parseBody(request);

    const result = await nguoiDungService.doiMatKhau(user.id, body, user);
    return successResponse(result, 'Đổi mật khẩu thành công');
  } catch (error) {
    return handleApiError(error);
  }
}
