// =========================================================
// Service - Thông báo (Notification)
// =========================================================

import { thongBaoRepository } from '@/repositories/thong-bao.repository';
import { NotFoundError, UnauthorizedError } from '@/lib/errors';
import { calculateSkip, calculatePaginationMeta, serializeBigInt } from '@/lib/utils';
import type { PaginationQuery, PaginatedResult } from '@/types';
import type { Prisma } from '@prisma/client';

export interface TaoThongBaoParams {
  nguoiDungId: bigint | string;
  loaiThongBao: string;
  tieuDe: string;
  noiDung: string;
  loaiDoiTuongThamChieu?: string;
  doiTuongThamChieuId?: bigint | string;
}

export class ThongBaoService {
  /**
   * Tạo thông báo (fire-and-forget an toàn)
   */
  async taoThongBao(params: TaoThongBaoParams) {
    try {
      return await thongBaoRepository.create({
        nguoiDung: { connect: { id: BigInt(params.nguoiDungId) } },
        loaiThongBao: params.loaiThongBao,
        tieuDe: params.tieuDe,
        noiDung: params.noiDung,
        loaiDoiTuongThamChieu: params.loaiDoiTuongThamChieu ?? null,
        doiTuongThamChieuId: params.doiTuongThamChieuId ? BigInt(params.doiTuongThamChieuId) : null,
      });
    } catch (error) {
      console.error('Lỗi tạo thông báo:', error);
      return null;
    }
  }

  /**
   * Lấy danh sách thông báo của người dùng
   */
  async getMyNotifications(
    userId: string,
    query: PaginationQuery & { daDoc?: string }
  ): Promise<PaginatedResult<unknown> & { soChuaDoc: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = calculateSkip(page, limit);

    const where: Prisma.ThongBaoWhereInput = {
      nguoiDungId: BigInt(userId),
    };

    if (query.daDoc !== undefined && query.daDoc !== '') {
      where.daDoc = query.daDoc === 'true';
    }

    const [data, total, unreadCount] = await Promise.all([
      thongBaoRepository.findMany({ skip, take: limit, where }),
      thongBaoRepository.count(where),
      thongBaoRepository.countUnread(BigInt(userId)),
    ]);

    return {
      data: serializeBigInt(data),
      meta: calculatePaginationMeta(total, page, limit),
      soChuaDoc: unreadCount,
    };
  }

  /**
   * Đánh dấu thông báo đã đọc
   */
  async danhDauDaDoc(id: string, userId: string) {
    const numId = BigInt(id);
    const tb = await thongBaoRepository.findById(numId);
    if (!tb) {
      throw new NotFoundError('Không tìm thấy thông báo');
    }

    if (tb.nguoiDungId !== BigInt(userId)) {
      throw new UnauthorizedError('Bạn không có quyền thao tác trên thông báo này');
    }

    const updated = await thongBaoRepository.markAsRead(numId);
    return serializeBigInt(updated);
  }

  /**
   * Đánh dấu tất cả thông báo của người dùng đã đọc
   */
  async danhDauTatCaDaDoc(userId: string) {
    const result = await thongBaoRepository.markAllAsRead(BigInt(userId));
    return { count: result.count, message: 'Đã đánh dấu tất cả thông báo là đã đọc' };
  }
}

export const thongBaoService = new ThongBaoService();
