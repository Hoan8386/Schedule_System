// =========================================================
// Service - Ca làm việc (Shift)
// =========================================================

import { caLamViecRepository } from '@/repositories/ca-lam-viec.repository';
import { nhatKyService } from '@/services/nhat-ky.service';
import { NotFoundError, ConflictError, BusinessError } from '@/lib/errors';
import { calculateSkip, calculatePaginationMeta, serializeBigInt } from '@/lib/utils';
import { validate } from '@/middleware/validation.middleware';
import {
  taoCaLamViecSchema,
  capNhatCaLamViecSchema,
} from '@/validators/ca-lam-viec.validator';
import type {
  TaoCaLamViecInput,
  CapNhatCaLamViecInput,
} from '@/validators/ca-lam-viec.validator';
import type { PaginationQuery, PaginatedResult, SessionUser } from '@/types';
import type { Prisma } from '@prisma/client';

function parseTimeToDate(timeStr: string): Date {
  return new Date(`1970-01-01T${timeStr}:00Z`);
}

function formatShiftData(shift: unknown): unknown {
  if (!shift || typeof shift !== 'object') return shift;
  const s = { ...(shift as Record<string, unknown>) };
  if (s.gioBatDau instanceof Date) {
    s.gioBatDau = s.gioBatDau.toISOString().substring(11, 16);
  }
  if (s.gioKetThuc instanceof Date) {
    s.gioKetThuc = s.gioKetThuc.toISOString().substring(11, 16);
  }
  return s;
}

export class CaLamViecService {
  /**
   * Lấy danh sách ca làm việc với phân trang
   */
  async getAll(
    query: PaginationQuery & { trangThai?: string }
  ): Promise<PaginatedResult<unknown>> {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = calculateSkip(page, limit);

    const where: Prisma.CaLamViecWhereInput = {};
    if (query.trangThai) {
      where.trangThai = query.trangThai;
    }
    if (query.search) {
      where.OR = [
        { tenCa: { contains: query.search, mode: 'insensitive' } },
        { maCa: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.CaLamViecOrderByWithRelationInput = {};
    if (query.sortBy) {
      (orderBy as Record<string, string>)[query.sortBy] = query.sortOrder || 'asc';
    } else {
      orderBy.thuTuHienThi = 'asc';
    }

    const [data, total] = await Promise.all([
      caLamViecRepository.findMany({ skip, take: limit, where, orderBy }),
      caLamViecRepository.count(where),
    ]);

    const formattedData = data.map((item) => formatShiftData(item));

    return {
      data: serializeBigInt(formattedData),
      meta: calculatePaginationMeta(total, page, limit),
    };
  }

  /**
   * Lấy chi tiết ca làm việc theo ID
   */
  async getById(id: string) {
    const ca = await caLamViecRepository.findById(BigInt(id));
    if (!ca) {
      throw new NotFoundError('Không tìm thấy ca làm việc');
    }
    return serializeBigInt(formatShiftData(ca));
  }

  /**
   * Tạo ca làm việc mới
   */
  async create(data: unknown, currentUser: SessionUser) {
    const validated = validate(taoCaLamViecSchema, data) as TaoCaLamViecInput;

    const existing = await caLamViecRepository.findByCode(validated.maCa);
    if (existing) {
      throw new ConflictError(`Mã ca "${validated.maCa}" đã tồn tại`);
    }

    const ca = await caLamViecRepository.create({
      maCa: validated.maCa,
      tenCa: validated.tenCa,
      gioBatDau: parseTimeToDate(validated.gioBatDau),
      gioKetThuc: parseTimeToDate(validated.gioKetThuc),
      soNguoiToiDa: validated.soNguoiToiDa,
      thuTuHienThi: validated.thuTuHienThi ?? 0,
      trangThai: validated.trangThai || 'HOAT_DONG',
    });

    await nhatKyService.ghiNhatKy({
      nguoiDungId: currentUser.id,
      hanhDong: 'TAO',
      loaiDoiTuong: 'CA_LAM_VIEC',
      doiTuongId: ca.id,
      duLieuMoi: ca,
    });

    return serializeBigInt(formatShiftData(ca));
  }

  /**
   * Cập nhật ca làm việc
   */
  async update(id: string, data: unknown, currentUser: SessionUser) {
    const validated = validate(capNhatCaLamViecSchema, data) as CapNhatCaLamViecInput;
    const numId = BigInt(id);

    const existing = await caLamViecRepository.findById(numId);
    if (!existing) {
      throw new NotFoundError('Không tìm thấy ca làm việc');
    }

    const updateData: Prisma.CaLamViecUpdateInput = {};
    if (validated.tenCa !== undefined) updateData.tenCa = validated.tenCa;
    if (validated.gioBatDau !== undefined) updateData.gioBatDau = parseTimeToDate(validated.gioBatDau);
    if (validated.gioKetThuc !== undefined) updateData.gioKetThuc = parseTimeToDate(validated.gioKetThuc);
    if (validated.soNguoiToiDa !== undefined) updateData.soNguoiToiDa = validated.soNguoiToiDa;
    if (validated.thuTuHienThi !== undefined) updateData.thuTuHienThi = validated.thuTuHienThi;
    if (validated.trangThai !== undefined) updateData.trangThai = validated.trangThai;

    const updated = await caLamViecRepository.update(numId, updateData);

    await nhatKyService.ghiNhatKy({
      nguoiDungId: currentUser.id,
      hanhDong: 'CAP_NHAT',
      loaiDoiTuong: 'CA_LAM_VIEC',
      doiTuongId: numId,
      duLieuCu: existing,
      duLieuMoi: updated,
    });

    return serializeBigInt(formatShiftData(updated));
  }

  /**
   * Xóa ca làm việc
   */
  async delete(id: string, currentUser: SessionUser) {
    const numId = BigInt(id);
    const existing = await caLamViecRepository.findById(numId);
    if (!existing) {
      throw new NotFoundError('Không tìm thấy ca làm việc');
    }

    if (existing._count.caTheoNgays > 0) {
      throw new BusinessError(
        'Không thể xóa ca làm việc đã được áp dụng vào lịch thực tế. Hãy đổi trạng thái sang "Tạm dừng".'
      );
    }

    const deleted = await caLamViecRepository.delete(numId);

    await nhatKyService.ghiNhatKy({
      nguoiDungId: currentUser.id,
      hanhDong: 'XOA',
      loaiDoiTuong: 'CA_LAM_VIEC',
      doiTuongId: numId,
      duLieuCu: existing,
    });

    return serializeBigInt(formatShiftData(deleted));
  }
}

export const caLamViecService = new CaLamViecService();
