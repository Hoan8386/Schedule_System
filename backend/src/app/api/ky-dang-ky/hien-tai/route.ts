// =========================================================
// API Route - Kỳ đăng ký hiện tại đang mở
// =========================================================

import { NextRequest } from 'next/server';
import { kyDangKyService } from '@/services/ky-dang-ky.service';
import { getAuthUser } from '@/middleware/auth.middleware';
import { successResponse, handleApiError } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    await getAuthUser(request);
    const ky = await kyDangKyService.getCurrentOpen();

    return successResponse(ky, 'Lấy kỳ đăng ký hiện tại thành công');
  } catch (error) {
    return handleApiError(error);
  }
}
