// =========================================================
// Service - Nhật ký hệ thống (Audit Log)
// =========================================================

import prisma from '@/lib/prisma';
import { serializeBigInt, calculateSkip, calculatePaginationMeta } from '@/lib/utils';
import type { PaginationQuery, PaginatedResult } from '@/types';

export interface GhiNhatKyParams {
  nguoiDungId?: bigint | string | null;
  hanhDong: string;
  loaiDoiTuong: string;
  doiTuongId?: bigint | string | number | null;
  duLieuCu?: unknown;
  duLieuMoi?: unknown;
  diaChiIp?: string | null;
}

export class NhatKyService {
  /**
   * Ghi nhật ký hoạt động
   */
  async ghiNhatKy(params: GhiNhatKyParams) {
    try {
      await prisma.nhatKyHeThong.create({
        data: {
          nguoiDungId: params.nguoiDungId ? BigInt(params.nguoiDungId) : null,
          hanhDong: params.hanhDong,
          loaiDoiTuong: params.loaiDoiTuong,
          doiTuongId: params.doiTuongId ? BigInt(params.doiTuongId) : null,
          duLieuCu: params.duLieuCu
            ? JSON.parse(JSON.stringify(params.duLieuCu, (_key, value) =>
                typeof value === 'bigint' ? value.toString() : value
              ))
            : null,
          duLieuMoi: params.duLieuMoi
            ? JSON.parse(JSON.stringify(params.duLieuMoi, (_key, value) =>
                typeof value === 'bigint' ? value.toString() : value
              ))
            : null,
          diaChiIp: params.diaChiIp ?? null,
        },
      });
    } catch (error) {
      // Nhật ký không nên block request chính
      console.error('Lỗi ghi nhật ký:', error);
    }
  }

  /**
   * Lấy danh sách nhật ký với phân trang
   */
  async getAll(query: PaginationQuery & {
    nguoiDungId?: string;
    hanhDong?: string;
    loaiDoiTuong?: string;
    tuNgay?: string;
    denNgay?: string;
  }): Promise<PaginatedResult<unknown>> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = calculateSkip(page, limit);

    const where: Record<string, unknown> = {};

    if (query.nguoiDungId) {
      where.nguoiDungId = BigInt(query.nguoiDungId);
    }
    if (query.hanhDong) {
      where.hanhDong = query.hanhDong;
    }
    if (query.loaiDoiTuong) {
      where.loaiDoiTuong = query.loaiDoiTuong;
    }
    if (query.tuNgay || query.denNgay) {
      where.createdAt = {
        ...(query.tuNgay && { gte: new Date(query.tuNgay) }),
        ...(query.denNgay && { lte: new Date(query.denNgay) }),
      };
    }

    const [data, total] = await Promise.all([
      prisma.nhatKyHeThong.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          nguoiDung: {
            select: {
              id: true,
              maNguoiDung: true,
              hoTen: true,
              email: true,
            },
          },
        },
      }),
      prisma.nhatKyHeThong.count({ where }),
    ]);

    return {
      data: serializeBigInt(data),
      meta: calculatePaginationMeta(total, page, limit),
    };
  }
}

export const nhatKyService = new NhatKyService();
