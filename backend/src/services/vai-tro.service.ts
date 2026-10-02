// =========================================================
// Service - Vai trò
// =========================================================

import { vaiTroRepository } from '@/repositories/vai-tro.repository';
import { nhatKyService } from '@/services/nhat-ky.service';
import { NotFoundError, ConflictError, BusinessError } from '@/lib/errors';
import { calculateSkip, calculatePaginationMeta, serializeBigInt } from '@/lib/utils';
import { validate } from '@/middleware/validation.middleware';
import { taoVaiTroSchema, capNhatVaiTroSchema, ganQuyenSchema } from '@/validators/vai-tro.validator';
import type { TaoVaiTroInput, CapNhatVaiTroInput } from '@/validators/vai-tro.validator';
import type { PaginationQuery, PaginatedResult, SessionUser } from '@/types';

export class VaiTroService {
  /**
   * Lấy danh sách vai trò với phân trang
   */
  async getAll(query: PaginationQuery): Promise<PaginatedResult<unknown>> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = calculateSkip(page, limit);

    const where: Record<string, unknown> = {};
    if (query.search) {
      where.OR = [
        { tenVaiTro: { contains: query.search, mode: 'insensitive' } },
        { maVaiTro: { contains: query.search, mode: 'insensitive' } },
        { moTa: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Record<string, string> = {};
    if (query.sortBy) {
      orderBy[query.sortBy] = query.sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [data, total] = await Promise.all([
      vaiTroRepository.findMany({ skip, take: limit, where, orderBy }),
      vaiTroRepository.count(where),
    ]);

    return {
      data: serializeBigInt(data),
      meta: calculatePaginationMeta(total, page, limit),
    };
  }

  /**
   * Lấy chi tiết vai trò theo ID
   */
  async getById(id: string) {
    const vaiTro = await vaiTroRepository.findById(BigInt(id));
    if (!vaiTro) {
      throw new NotFoundError('Không tìm thấy vai trò');
    }
    return serializeBigInt(vaiTro);
  }

  /**
   * Tạo vai trò mới
   */
  async create(data: unknown, user: SessionUser) {
    const validated = validate(taoVaiTroSchema, data) as TaoVaiTroInput;

    // Kiểm tra mã vai trò trùng
    const existing = await vaiTroRepository.findByMa(validated.maVaiTro);
    if (existing) {
      throw new ConflictError(`Mã vai trò "${validated.maVaiTro}" đã tồn tại`);
    }

    const vaiTro = await vaiTroRepository.create({
      maVaiTro: validated.maVaiTro,
      tenVaiTro: validated.tenVaiTro,
      moTa: validated.moTa ?? null,
      dangHoatDong: validated.dangHoatDong,
    });

    // Ghi nhật ký
    await nhatKyService.ghiNhatKy({
      nguoiDungId: BigInt(user.id),
      hanhDong: 'TAO',
      loaiDoiTuong: 'VAI_TRO',
      doiTuongId: vaiTro.id,
      duLieuMoi: vaiTro,
    });

    return serializeBigInt(vaiTro);
  }

  /**
   * Cập nhật vai trò
   */
  async update(id: string, data: unknown, user: SessionUser) {
    const validated = validate(capNhatVaiTroSchema, data) as CapNhatVaiTroInput;
    const bigIntId = BigInt(id);

    // Kiểm tra tồn tại
    const existing = await vaiTroRepository.findById(bigIntId);
    if (!existing) {
      throw new NotFoundError('Không tìm thấy vai trò');
    }

    const vaiTro = await vaiTroRepository.update(bigIntId, {
      ...(validated.tenVaiTro !== undefined && { tenVaiTro: validated.tenVaiTro }),
      ...(validated.moTa !== undefined && { moTa: validated.moTa }),
      ...(validated.dangHoatDong !== undefined && { dangHoatDong: validated.dangHoatDong }),
    });

    // Ghi nhật ký
    await nhatKyService.ghiNhatKy({
      nguoiDungId: BigInt(user.id),
      hanhDong: 'CAP_NHAT',
      loaiDoiTuong: 'VAI_TRO',
      doiTuongId: vaiTro.id,
      duLieuCu: existing,
      duLieuMoi: vaiTro,
    });

    return serializeBigInt(vaiTro);
  }

  /**
   * Xóa vai trò
   */
  async delete(id: string, user: SessionUser) {
    const bigIntId = BigInt(id);

    // Kiểm tra tồn tại
    const existing = await vaiTroRepository.findById(bigIntId);
    if (!existing) {
      throw new NotFoundError('Không tìm thấy vai trò');
    }

    // Kiểm tra đang sử dụng
    const isInUse = await vaiTroRepository.isInUse(bigIntId);
    if (isInUse) {
      throw new BusinessError(
        'Không thể xóa vai trò đang được sử dụng bởi người dùng',
        'ROLE_IN_USE'
      );
    }

    await vaiTroRepository.delete(bigIntId);

    // Ghi nhật ký
    await nhatKyService.ghiNhatKy({
      nguoiDungId: BigInt(user.id),
      hanhDong: 'XOA',
      loaiDoiTuong: 'VAI_TRO',
      doiTuongId: bigIntId,
      duLieuCu: existing,
    });
  }

  /**
   * Gán quyền cho vai trò
   */
  async ganQuyen(id: string, data: unknown, user: SessionUser) {
    const validated = validate(ganQuyenSchema, data);
    const bigIntId = BigInt(id);

    // Kiểm tra tồn tại
    const existing = await vaiTroRepository.findById(bigIntId);
    if (!existing) {
      throw new NotFoundError('Không tìm thấy vai trò');
    }

    const quyenIds = validated.quyenIds.map((qId: string) => BigInt(qId));
    const result = await vaiTroRepository.ganQuyen(bigIntId, quyenIds);

    // Ghi nhật ký
    await nhatKyService.ghiNhatKy({
      nguoiDungId: BigInt(user.id),
      hanhDong: 'GAN_QUYEN',
      loaiDoiTuong: 'VAI_TRO',
      doiTuongId: bigIntId,
      duLieuCu: { quyens: existing.vaiTroQuyens },
      duLieuMoi: { quyenIds: validated.quyenIds },
    });

    return serializeBigInt(result);
  }
}

export const vaiTroService = new VaiTroService();
