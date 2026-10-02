// =========================================================
// Service - Nội quy lịch (Schedule Regulation)
// =========================================================

import { noiQuyRepository } from '@/repositories/noi-quy.repository';
import { nhatKyService } from '@/services/nhat-ky.service';
import { NotFoundError } from '@/lib/errors';
import { calculateSkip, calculatePaginationMeta, serializeBigInt } from '@/lib/utils';
import { validate } from '@/middleware/validation.middleware';
import {
  taoNoiQuySchema,
  capNhatNoiQuySchema,
} from '@/validators/noi-quy.validator';
import type {
  TaoNoiQuyInput,
  CapNhatNoiQuyInput,
} from '@/validators/noi-quy.validator';
import type { PaginationQuery, PaginatedResult, SessionUser } from '@/types';
import type { Prisma } from '@prisma/client';

export class NoiQuyService {
  async getAll(
    query: PaginationQuery & { kyDangKyLichId?: string; trangThai?: string }
  ): Promise<PaginatedResult<unknown>> {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = calculateSkip(page, limit);

    const where: Prisma.NoiQuyLichWhereInput = {};
    if (query.kyDangKyLichId) {
      where.kyDangKyLichId = BigInt(query.kyDangKyLichId);
    }
    if (query.trangThai) {
      where.trangThai = query.trangThai;
    }
    if (query.search) {
      where.OR = [
        { tieuDe: { contains: query.search, mode: 'insensitive' } },
        { noiDung: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      noiQuyRepository.findMany({ skip, take: limit, where }),
      noiQuyRepository.count(where),
    ]);

    return {
      data: serializeBigInt(data),
      meta: calculatePaginationMeta(total, page, limit),
    };
  }

  async getById(id: string) {
    const item = await noiQuyRepository.findById(BigInt(id));
    if (!item) {
      throw new NotFoundError('Không tìm thấy nội quy');
    }
    return serializeBigInt(item);
  }

  async create(data: unknown, currentUser: SessionUser) {
    const validated = validate(taoNoiQuySchema, data) as TaoNoiQuyInput;

    const item = await noiQuyRepository.create({
      tieuDe: validated.tieuDe,
      noiDung: validated.noiDung,
      trangThai: validated.trangThai || 'HOAT_DONG',
      nguoiTao: { connect: { id: BigInt(currentUser.id) } },
      ...(validated.kyDangKyLichId && {
        kyDangKyLich: { connect: { id: BigInt(validated.kyDangKyLichId) } },
      }),
    });

    await nhatKyService.ghiNhatKy({
      nguoiDungId: currentUser.id,
      hanhDong: 'TAO',
      loaiDoiTuong: 'NOI_QUY_LICH',
      doiTuongId: item.id,
      duLieuMoi: item,
    });

    return serializeBigInt(item);
  }

  async update(id: string, data: unknown, currentUser: SessionUser) {
    const validated = validate(capNhatNoiQuySchema, data) as CapNhatNoiQuyInput;
    const numId = BigInt(id);

    const existing = await noiQuyRepository.findById(numId);
    if (!existing) {
      throw new NotFoundError('Không tìm thấy nội quy');
    }

    const updated = await noiQuyRepository.update(numId, validated);

    await nhatKyService.ghiNhatKy({
      nguoiDungId: currentUser.id,
      hanhDong: 'CAP_NHAT',
      loaiDoiTuong: 'NOI_QUY_LICH',
      doiTuongId: numId,
      duLieuCu: existing,
      duLieuMoi: updated,
    });

    return serializeBigInt(updated);
  }

  async delete(id: string, currentUser: SessionUser) {
    const numId = BigInt(id);
    const existing = await noiQuyRepository.findById(numId);
    if (!existing) {
      throw new NotFoundError('Không tìm thấy nội quy');
    }

    const deleted = await noiQuyRepository.delete(numId);

    await nhatKyService.ghiNhatKy({
      nguoiDungId: currentUser.id,
      hanhDong: 'XOA',
      loaiDoiTuong: 'NOI_QUY_LICH',
      doiTuongId: numId,
      duLieuCu: existing,
    });

    return serializeBigInt(deleted);
  }
}

export const noiQuyService = new NoiQuyService();
