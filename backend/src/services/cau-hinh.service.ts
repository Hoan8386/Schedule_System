// =========================================================
// Service - Cấu hình hệ thống (System Config)
// =========================================================

import { cauHinhRepository } from '@/repositories/cau-hinh.repository';
import { nhatKyService } from '@/services/nhat-ky.service';
import { NotFoundError } from '@/lib/errors';
import { calculateSkip, calculatePaginationMeta, serializeBigInt } from '@/lib/utils';
import { validate } from '@/middleware/validation.middleware';
import { capNhatCauHinhSchema } from '@/validators/cau-hinh.validator';
import type { CapNhatCauHinhInput } from '@/validators/cau-hinh.validator';
import type { PaginationQuery, PaginatedResult, SessionUser } from '@/types';
import type { Prisma } from '@prisma/client';

export class CauHinhService {
  async getAll(query: PaginationQuery): Promise<PaginatedResult<unknown>> {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = calculateSkip(page, limit);

    const where: Prisma.CauHinhHeThongWhereInput = {};
    if (query.search) {
      where.OR = [
        { maCauHinh: { contains: query.search, mode: 'insensitive' } },
        { moTa: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      cauHinhRepository.findMany({ skip, take: limit, where }),
      cauHinhRepository.count(where),
    ]);

    return {
      data: serializeBigInt(data),
      meta: calculatePaginationMeta(total, page, limit),
    };
  }

  async getById(id: string) {
    const item = await cauHinhRepository.findById(BigInt(id));
    if (!item) {
      throw new NotFoundError('Không tìm thấy cấu hình');
    }
    return serializeBigInt(item);
  }

  async getByCode(maCauHinh: string) {
    const item = await cauHinhRepository.findByCode(maCauHinh);
    if (!item) {
      throw new NotFoundError(`Không tìm thấy cấu hình "${maCauHinh}"`);
    }
    return serializeBigInt(item);
  }

  async update(id: string, data: unknown, currentUser: SessionUser) {
    const validated = validate(capNhatCauHinhSchema, data) as CapNhatCauHinhInput;
    const numId = BigInt(id);

    const existing = await cauHinhRepository.findById(numId);
    if (!existing) {
      throw new NotFoundError('Không tìm thấy cấu hình');
    }

    const updated = await cauHinhRepository.update(numId, validated);

    await nhatKyService.ghiNhatKy({
      nguoiDungId: currentUser.id,
      hanhDong: 'CAP_NHAT',
      loaiDoiTuong: 'CAU_HINH_HE_THONG',
      doiTuongId: numId,
      duLieuCu: existing,
      duLieuMoi: updated,
    });

    return serializeBigInt(updated);
  }
}

export const cauHinhService = new CauHinhService();
