// =========================================================
// Service - Ngày lễ (Holiday)
// =========================================================

import { ngayLeRepository } from '@/repositories/ngay-le.repository';
import { nhatKyService } from '@/services/nhat-ky.service';
import { NotFoundError, ConflictError } from '@/lib/errors';
import { calculateSkip, calculatePaginationMeta, serializeBigInt } from '@/lib/utils';
import { validate } from '@/middleware/validation.middleware';
import {
  taoNgayLeSchema,
  capNhatNgayLeSchema,
} from '@/validators/ngay-le.validator';
import type {
  TaoNgayLeInput,
  CapNhatNgayLeInput,
} from '@/validators/ngay-le.validator';
import type { PaginationQuery, PaginatedResult, SessionUser } from '@/types';
import type { Prisma } from '@prisma/client';

function formatHoliday(h: unknown): unknown {
  if (!h || typeof h !== 'object') return h;
  const item = { ...(h as Record<string, unknown>) };
  if (item.ngay instanceof Date) {
    item.ngay = item.ngay.toISOString().substring(0, 10);
  }
  return item;
}

export class NgayLeService {
  async getAll(
    query: PaginationQuery & { tuNgay?: string; denNgay?: string }
  ): Promise<PaginatedResult<unknown>> {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = calculateSkip(page, limit);

    const where: Prisma.NgayLeWhereInput = {};
    if (query.tuNgay || query.denNgay) {
      where.ngay = {};
      if (query.tuNgay) where.ngay.gte = new Date(query.tuNgay);
      if (query.denNgay) where.ngay.lte = new Date(query.denNgay);
    }
    if (query.search) {
      where.tenNgayLe = { contains: query.search, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      ngayLeRepository.findMany({ skip, take: limit, where }),
      ngayLeRepository.count(where),
    ]);

    const formatted = data.map((d) => formatHoliday(d));

    return {
      data: serializeBigInt(formatted),
      meta: calculatePaginationMeta(total, page, limit),
    };
  }

  async getById(id: string) {
    const item = await ngayLeRepository.findById(BigInt(id));
    if (!item) {
      throw new NotFoundError('Không tìm thấy ngày lễ');
    }
    return serializeBigInt(formatHoliday(item));
  }

  async create(data: unknown, currentUser: SessionUser) {
    const validated = validate(taoNgayLeSchema, data) as TaoNgayLeInput;
    const dateObj = new Date(validated.ngay);

    const existing = await ngayLeRepository.findByDate(dateObj);
    if (existing) {
      throw new ConflictError(`Đã có ngày lễ "${existing.tenNgayLe}" trong ngày này`);
    }

    const item = await ngayLeRepository.create({
      tenNgayLe: validated.tenNgayLe,
      ngay: dateObj,
      moTa: validated.moTa,
      dangHoatDong: validated.dangHoatDong ?? true,
    });

    await nhatKyService.ghiNhatKy({
      nguoiDungId: currentUser.id,
      hanhDong: 'TAO',
      loaiDoiTuong: 'NGAY_LE',
      doiTuongId: item.id,
      duLieuMoi: item,
    });

    return serializeBigInt(formatHoliday(item));
  }

  async update(id: string, data: unknown, currentUser: SessionUser) {
    const validated = validate(capNhatNgayLeSchema, data) as CapNhatNgayLeInput;
    const numId = BigInt(id);

    const existing = await ngayLeRepository.findById(numId);
    if (!existing) {
      throw new NotFoundError('Không tìm thấy ngày lễ');
    }

    const updateData: Prisma.NgayLeUpdateInput = {};
    if (validated.tenNgayLe !== undefined) updateData.tenNgayLe = validated.tenNgayLe;
    if (validated.ngay !== undefined) updateData.ngay = new Date(validated.ngay);
    if (validated.moTa !== undefined) updateData.moTa = validated.moTa;
    if (validated.dangHoatDong !== undefined) updateData.dangHoatDong = validated.dangHoatDong;

    const updated = await ngayLeRepository.update(numId, updateData);

    await nhatKyService.ghiNhatKy({
      nguoiDungId: currentUser.id,
      hanhDong: 'CAP_NHAT',
      loaiDoiTuong: 'NGAY_LE',
      doiTuongId: numId,
      duLieuCu: existing,
      duLieuMoi: updated,
    });

    return serializeBigInt(formatHoliday(updated));
  }

  async delete(id: string, currentUser: SessionUser) {
    const numId = BigInt(id);
    const existing = await ngayLeRepository.findById(numId);
    if (!existing) {
      throw new NotFoundError('Không tìm thấy ngày lễ');
    }

    const deleted = await ngayLeRepository.delete(numId);

    await nhatKyService.ghiNhatKy({
      nguoiDungId: currentUser.id,
      hanhDong: 'XOA',
      loaiDoiTuong: 'NGAY_LE',
      doiTuongId: numId,
      duLieuCu: existing,
    });

    return serializeBigInt(formatHoliday(deleted));
  }
}

export const ngayLeService = new NgayLeService();
