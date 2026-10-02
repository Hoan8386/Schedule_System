// =========================================================
// Service - Kỳ đăng ký lịch (Registration Period)
// =========================================================

import { kyDangKyRepository } from '@/repositories/ky-dang-ky.repository';
import { nhatKyService } from '@/services/nhat-ky.service';
import { NotFoundError, ConflictError, BusinessError } from '@/lib/errors';
import { calculateSkip, calculatePaginationMeta, serializeBigInt } from '@/lib/utils';
import { validate } from '@/middleware/validation.middleware';
import {
  taoKyDangKySchema,
  capNhatKyDangKySchema,
} from '@/validators/ky-dang-ky.validator';
import type {
  TaoKyDangKyInput,
  CapNhatKyDangKyInput,
} from '@/validators/ky-dang-ky.validator';
import type { PaginationQuery, PaginatedResult, SessionUser } from '@/types';
import type { Prisma } from '@prisma/client';

export class KyDangKyService {
  /**
   * Lấy danh sách kỳ đăng ký với phân trang và bộ lọc
   */
  async getAll(
    query: PaginationQuery & { nam?: string; thang?: string; trangThai?: string }
  ): Promise<PaginatedResult<unknown>> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = calculateSkip(page, limit);

    const where: Prisma.KyDangKyLichWhereInput = {};
    if (query.nam) where.nam = parseInt(query.nam, 10);
    if (query.thang) where.thang = parseInt(query.thang, 10);
    if (query.trangThai) where.trangThai = query.trangThai;
    if (query.search) {
      where.tenKy = { contains: query.search, mode: 'insensitive' };
    }

    const orderBy: Prisma.KyDangKyLichOrderByWithRelationInput = {};
    if (query.sortBy) {
      (orderBy as Record<string, string>)[query.sortBy] = query.sortOrder || 'desc';
    } else {
      orderBy.nam = 'desc';
    }

    const [data, total] = await Promise.all([
      kyDangKyRepository.findMany({ skip, take: limit, where, orderBy }),
      kyDangKyRepository.count(where),
    ]);

    return {
      data: serializeBigInt(data),
      meta: calculatePaginationMeta(total, page, limit),
    };
  }

  /**
   * Lấy chi tiết kỳ đăng ký theo ID
   */
  async getById(id: string) {
    const ky = await kyDangKyRepository.findById(BigInt(id));
    if (!ky) {
      throw new NotFoundError('Không tìm thấy kỳ đăng ký');
    }
    return serializeBigInt(ky);
  }

  /**
   * Lấy kỳ đăng ký đang mở hiện tại
   */
  async getCurrentOpen() {
    const ky = await kyDangKyRepository.findCurrentOpen();
    return ky ? serializeBigInt(ky) : null;
  }

  /**
   * Tạo kỳ đăng ký mới
   */
  async create(data: unknown, currentUser: SessionUser) {
    const validated = validate(taoKyDangKySchema, data) as TaoKyDangKyInput;

    const existing = await kyDangKyRepository.findByYearAndMonth(validated.nam, validated.thang);
    if (existing) {
      throw new ConflictError(
        `Đã tồn tại kỳ đăng ký cho tháng ${validated.thang}/${validated.nam}`
      );
    }

    const ky = await kyDangKyRepository.create({
      tenKy: validated.tenKy,
      nam: validated.nam,
      thang: validated.thang,
      thoiGianMoDangKy: validated.thoiGianMoDangKy ? new Date(validated.thoiGianMoDangKy) : null,
      thoiGianDongDangKy: validated.thoiGianDongDangKy ? new Date(validated.thoiGianDongDangKy) : null,
      thoiGianChotLich: validated.thoiGianChotLich ? new Date(validated.thoiGianChotLich) : null,
      trangThai: validated.trangThai || 'NHAP',
      nguoiTao: {
        connect: { id: BigInt(currentUser.id) },
      },
    });

    await nhatKyService.ghiNhatKy({
      nguoiDungId: currentUser.id,
      hanhDong: 'TAO',
      loaiDoiTuong: 'KY_DANG_KY_LICH',
      doiTuongId: ky.id,
      duLieuMoi: ky,
    });

    return serializeBigInt(ky);
  }

  /**
   * Cập nhật kỳ đăng ký
   */
  async update(id: string, data: unknown, currentUser: SessionUser) {
    const validated = validate(capNhatKyDangKySchema, data) as CapNhatKyDangKyInput;
    const numId = BigInt(id);

    const existing = await kyDangKyRepository.findById(numId);
    if (!existing) {
      throw new NotFoundError('Không tìm thấy kỳ đăng ký');
    }

    const updateData: Prisma.KyDangKyLichUpdateInput = {};
    if (validated.tenKy !== undefined) updateData.tenKy = validated.tenKy;
    if (validated.thoiGianMoDangKy !== undefined) {
      updateData.thoiGianMoDangKy = validated.thoiGianMoDangKy ? new Date(validated.thoiGianMoDangKy) : null;
    }
    if (validated.thoiGianDongDangKy !== undefined) {
      updateData.thoiGianDongDangKy = validated.thoiGianDongDangKy ? new Date(validated.thoiGianDongDangKy) : null;
    }
    if (validated.thoiGianChotLich !== undefined) {
      updateData.thoiGianChotLich = validated.thoiGianChotLich ? new Date(validated.thoiGianChotLich) : null;
    }
    if (validated.trangThai !== undefined) {
      updateData.trangThai = validated.trangThai;
    }

    const updated = await kyDangKyRepository.update(numId, updateData);

    await nhatKyService.ghiNhatKy({
      nguoiDungId: currentUser.id,
      hanhDong: 'CAP_NHAT',
      loaiDoiTuong: 'KY_DANG_KY_LICH',
      doiTuongId: numId,
      duLieuCu: existing,
      duLieuMoi: updated,
    });

    return serializeBigInt(updated);
  }

  /**
   * Xóa kỳ đăng ký
   */
  async delete(id: string, currentUser: SessionUser) {
    const numId = BigInt(id);
    const existing = await kyDangKyRepository.findById(numId);
    if (!existing) {
      throw new NotFoundError('Không tìm thấy kỳ đăng ký');
    }

    if (existing._count.caTheoNgays > 0) {
      throw new BusinessError(
        'Không thể xóa kỳ đăng ký đã tạo các ca làm việc. Hãy xóa các ca làm việc trước.'
      );
    }

    const deleted = await kyDangKyRepository.delete(numId);

    await nhatKyService.ghiNhatKy({
      nguoiDungId: currentUser.id,
      hanhDong: 'XOA',
      loaiDoiTuong: 'KY_DANG_KY_LICH',
      doiTuongId: numId,
      duLieuCu: existing,
    });

    return serializeBigInt(deleted);
  }
}

export const kyDangKyService = new KyDangKyService();
