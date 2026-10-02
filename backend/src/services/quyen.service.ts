// =========================================================
// Service - Quyền (Permission)
// =========================================================

import { quyenRepository } from '@/repositories/quyen.repository';
import { nhatKyService } from '@/services/nhat-ky.service';
import { NotFoundError, ConflictError, BusinessError } from '@/lib/errors';
import { calculateSkip, calculatePaginationMeta, serializeBigInt } from '@/lib/utils';
import { validate } from '@/middleware/validation.middleware';
import { taoQuyenSchema, capNhatQuyenSchema } from '@/validators/quyen.validator';
import type { TaoQuyenInput, CapNhatQuyenInput } from '@/validators/quyen.validator';
import type { PaginationQuery, PaginatedResult, SessionUser } from '@/types';
import type { Prisma } from '@prisma/client';

export class QuyenService {
  /**
   * Lấy danh sách quyền với phân trang
   */
  async getAll(query: PaginationQuery): Promise<PaginatedResult<unknown>> {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = calculateSkip(page, limit);

    const where: Prisma.QuyenWhereInput = {};
    if (query.search) {
      where.OR = [
        { tenQuyen: { contains: query.search, mode: 'insensitive' } },
        { maQuyen: { contains: query.search, mode: 'insensitive' } },
        { apiPath: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.QuyenOrderByWithRelationInput = {};
    if (query.sortBy) {
      (orderBy as Record<string, string>)[query.sortBy] = query.sortOrder || 'asc';
    } else {
      orderBy.maQuyen = 'asc';
    }

    const [data, total] = await Promise.all([
      quyenRepository.findMany({ skip, take: limit, where, orderBy }),
      quyenRepository.count(where),
    ]);

    return {
      data: serializeBigInt(data),
      meta: calculatePaginationMeta(total, page, limit),
    };
  }

  /**
   * Lấy chi tiết quyền theo ID
   */
  async getById(id: string) {
    const quyen = await quyenRepository.findById(BigInt(id));
    if (!quyen) {
      throw new NotFoundError('Không tìm thấy quyền');
    }
    return serializeBigInt(quyen);
  }

  /**
   * Tạo quyền mới
   */
  async create(data: unknown, currentUser: SessionUser) {
    const validated = validate(taoQuyenSchema, data) as TaoQuyenInput;

    const existingCode = await quyenRepository.findByCode(validated.maQuyen);
    if (existingCode) {
      throw new ConflictError(`Mã quyền "${validated.maQuyen}" đã tồn tại`);
    }

    const existingApi = await quyenRepository.findByApiAndMethod(
      validated.apiPath,
      validated.httpMethod
    );
    if (existingApi) {
      throw new ConflictError(
        `Đã tồn tại quyền cho ${validated.httpMethod} ${validated.apiPath}`
      );
    }

    const quyen = await quyenRepository.create({
      maQuyen: validated.maQuyen,
      tenQuyen: validated.tenQuyen,
      apiPath: validated.apiPath,
      httpMethod: validated.httpMethod,
      moTa: validated.moTa,
      dangHoatDong: validated.dangHoatDong ?? true,
    });

    await nhatKyService.ghiNhatKy({
      nguoiDungId: currentUser.id,
      hanhDong: 'TAO',
      loaiDoiTuong: 'QUYEN',
      doiTuongId: quyen.id,
      duLieuMoi: quyen,
    });

    return serializeBigInt(quyen);
  }

  /**
   * Cập nhật quyền
   */
  async update(id: string, data: unknown, currentUser: SessionUser) {
    const validated = validate(capNhatQuyenSchema, data) as CapNhatQuyenInput;
    const numId = BigInt(id);

    const existing = await quyenRepository.findById(numId);
    if (!existing) {
      throw new NotFoundError('Không tìm thấy quyền');
    }

    if (validated.apiPath && validated.httpMethod) {
      const existingApi = await quyenRepository.findByApiAndMethod(
        validated.apiPath,
        validated.httpMethod
      );
      if (existingApi && existingApi.id !== numId) {
        throw new ConflictError(
          `Đã tồn tại quyền cho ${validated.httpMethod} ${validated.apiPath}`
        );
      }
    }

    const updated = await quyenRepository.update(numId, validated);

    await nhatKyService.ghiNhatKy({
      nguoiDungId: currentUser.id,
      hanhDong: 'CAP_NHAT',
      loaiDoiTuong: 'QUYEN',
      doiTuongId: numId,
      duLieuCu: existing,
      duLieuMoi: updated,
    });

    return serializeBigInt(updated);
  }

  /**
   * Xóa quyền
   */
  async delete(id: string, currentUser: SessionUser) {
    const numId = BigInt(id);
    const existing = await quyenRepository.findById(numId);
    if (!existing) {
      throw new NotFoundError('Không tìm thấy quyền');
    }

    if (existing.vaiTroQuyens.length > 0) {
      throw new BusinessError(
        `Không thể xóa quyền này vì đang được gán cho ${existing.vaiTroQuyens.length} vai trò. Hãy gỡ khỏi vai trò trước.`
      );
    }

    const deleted = await quyenRepository.delete(numId);

    await nhatKyService.ghiNhatKy({
      nguoiDungId: currentUser.id,
      hanhDong: 'XOA',
      loaiDoiTuong: 'QUYEN',
      doiTuongId: numId,
      duLieuCu: existing,
    });

    return serializeBigInt(deleted);
  }
}

export const quyenService = new QuyenService();
