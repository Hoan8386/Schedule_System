// =========================================================
// Auth Middleware - Kiểm tra xác thực
// =========================================================

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { UnauthorizedError } from '@/lib/errors';
import type { SessionUser } from '@/types';

/**
 * Lấy session user từ request
 * Throw UnauthorizedError nếu chưa đăng nhập
 */
export async function getAuthUser(request: NextRequest): Promise<SessionUser> {
  const session = await auth();

  if (!session?.user) {
    throw new UnauthorizedError();
  }

  return session.user as SessionUser;
}

/**
 * Kiểm tra xác thực (optional - không throw error)
 */
export async function getOptionalAuthUser(): Promise<SessionUser | null> {
  const session = await auth();
  return (session?.user as SessionUser) || null;
}
