// =========================================================
// API Route - Tạo hàng loạt ca theo ngày (Batch generate)
// =========================================================

import { NextRequest } from 'next/server';
import { lichService } from '@/services/lich.service';
import { getAuthUser } from '@/middleware/auth.middleware';
import { checkPermission } from '@/middleware/rbac.middleware';
import { createdResponse, handleApiError, parseBody } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    await checkPermission(user, '/api/lich', 'POST');

    const body = await parseBody(request);
    const result = await lichService.createBatch(body, user);

    return createdResponse(result, result.message);
  } catch (error) {
    return handleApiError(error);
  }
}
