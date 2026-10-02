// =========================================================
// Service - Quy tắc lịch (Schedule Rule)
// =========================================================

import { quyTacLichRepository } from '@/repositories/quy-tac-lich.repository';
import { nhatKyService } from '@/services/nhat-ky.service';
import { NotFoundError } from '@/lib/errors';
import { calculateSkip, calculatePaginationMeta, serializeBigInt } from '@/lib/utils';
import { validate } from '@/middleware/validation.middleware';
import {
  taoQuyTacSchema,
  capNhatQuyTacSchema,
} from '@/validators/quy-tac-lich.validator';
import type {
  TaoQuyTacInput,
  CapNhatQuyTacInput,
} from '@/validators/quy-tac-lich.validator';
import type { PaginationQuery, PaginatedResult, SessionUser } from '@/types';
import type { Prisma } from '@prisma/client';

export class QuyTacLichService {
  async getAll(
    query: PaginationQuery & { kyDangKyLichId?: string }
  ): Promise<PaginatedResult<unknown>> {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = calculateSkip(page, limit);

    const where: Prisma.QuyTacLichWhereInput = {};
    if (query.kyDangKyLichId) {
      where.kyDangKyLichId = BigInt(query.kyDangKyLichId);
    }
    if (query.search) {
      where.OR = [
        { maQuyTac: { contains: query.search, mode: 'insensitive' } },
        { moTa: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      quyTacLichRepository.findMany({ skip, take: limit, where }),
      quyTacLichRepository.count(where),
    ]);

    return {
      data: serializeBigInt(data),
      meta: calculatePaginationMeta(total, page, limit),
    };
  }

  async getById(id: string) {
    const item = await quyTacLichRepository.findById(BigInt(id));
    if (!item) {
      throw new NotFoundError('Không tìm thấy quy tắc');
    }
    return serializeBigInt(item);
  }

  async create(data: unknown, currentUser: SessionUser) {
    const validated = validate(taoQuyTacSchema, data) as TaoQuyTacInput;

    const item = await quyTacLichRepository.create({
      maQuyTac: validated.maQuyTac,
      giaTri: validated.giaTri,
      moTa: validated.moTa,
      dangHoatDong: validated.dangHoatDong ?? true,
      ...(validated.kyDangKyLichId && {
        kyDangKyLich: { connect: { id: BigInt(validated.kyDangKyLichId) } },
      }),
    });

    await nhatKyService.ghiNhatKy({
      nguoiDungId: currentUser.id,
      hanhDong: 'TAO',
      loaiDoiTuong: 'QUY_TAC_LICH',
      doiTuongId: item.id,
      duLieuMoi: item,
    });

    return serializeBigInt(item);
  }

  async update(id: string, data: unknown, currentUser: SessionUser) {
    const validated = validate(capNhatQuyTacSchema, data) as CapNhatQuyTacInput;
    const numId = BigInt(id);

    const existing = await quyTacLichRepository.findById(numId);
    if (!existing) {
      throw new NotFoundError('Không tìm thấy quy tắc');
    }

    const updated = await quyTacLichRepository.update(numId, validated);

    await nhatKyService.ghiNhatKy({
      nguoiDungId: currentUser.id,
      hanhDong: 'CAP_NHAT',
      loaiDoiTuong: 'QUY_TAC_LICH',
      doiTuongId: numId,
      duLieuCu: existing,
      duLieuMoi: updated,
    });

    return serializeBigInt(updated);
  }

  async delete(id: string, currentUser: SessionUser) {
    const numId = BigInt(id);
    const existing = await quyTacLichRepository.findById(numId);
    if (!existing) {
      throw new NotFoundError('Không tìm thấy quy tắc');
    }

    const deleted = await quyTacLichRepository.delete(numId);

    await nhatKyService.ghiNhatKy({
      nguoiDungId: currentUser.id,
      hanhDong: 'XOA',
      loaiDoiTuong: 'QUY_TAC_LICH',
      doiTuongId: numId,
      duLieuCu: existing,
    });

    return serializeBigInt(deleted);
  }
}

export const quyTacLichService = new QuyTacLichService();
