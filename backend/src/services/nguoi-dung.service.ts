// =========================================================
// Service - Người dùng (User)
// =========================================================

import bcryptjs from 'bcryptjs';
import { nguoiDungRepository } from '@/repositories/nguoi-dung.repository';
import { vaiTroRepository } from '@/repositories/vai-tro.repository';
import { nhatKyService } from '@/services/nhat-ky.service';
import { NotFoundError, ConflictError, BusinessError, UnauthorizedError } from '@/lib/errors';
import { calculateSkip, calculatePaginationMeta, serializeBigInt } from '@/lib/utils';
import { validate } from '@/middleware/validation.middleware';
import {
  taoNguoiDungSchema,
  capNhatNguoiDungSchema,
  doiMatKhauSchema,
} from '@/validators/nguoi-dung.validator';
import type {
  TaoNguoiDungInput,
  CapNhatNguoiDungInput,
  DoiMatKhauInput,
} from '@/validators/nguoi-dung.validator';
import type { PaginationQuery, PaginatedResult, SessionUser } from '@/types';
import type { Prisma } from '@prisma/client';

export class NguoiDungService {
  /**
   * Lấy danh sách người dùng với phân trang và lọc
   */
  async getAll(
    query: PaginationQuery & { vaiTroId?: string; trangThai?: string }
  ): Promise<PaginatedResult<unknown>> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = calculateSkip(page, limit);

    const where: Prisma.NguoiDungWhereInput = {};

    if (query.vaiTroId) {
      where.vaiTroId = BigInt(query.vaiTroId);
    }

    if (query.trangThai) {
      where.trangThai = query.trangThai;
    }

    if (query.search) {
      where.OR = [
        { hoTen: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { maNguoiDung: { contains: query.search, mode: 'insensitive' } },
        { soDienThoai: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.NguoiDungOrderByWithRelationInput = {};
    if (query.sortBy) {
      (orderBy as Record<string, string>)[query.sortBy] = query.sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [data, total] = await Promise.all([
      nguoiDungRepository.findMany({ skip, take: limit, where, orderBy }),
      nguoiDungRepository.count(where),
    ]);

    return {
      data: serializeBigInt(data),
      meta: calculatePaginationMeta(total, page, limit),
    };
  }

  /**
   * Lấy chi tiết người dùng theo ID
   */
  async getById(id: string) {
    const nguoiDung = await nguoiDungRepository.findById(BigInt(id));
    if (!nguoiDung) {
      throw new NotFoundError('Không tìm thấy người dùng');
    }
    return serializeBigInt(nguoiDung);
  }

  /**
   * Tạo người dùng mới
   */
  async create(data: unknown, currentUser: SessionUser) {
    const validated = validate(taoNguoiDungSchema, data) as TaoNguoiDungInput;

    // Kiểm tra mã người dùng trùng
    const existingCode = await nguoiDungRepository.findByCode(validated.maNguoiDung);
    if (existingCode) {
      throw new ConflictError(`Mã người dùng "${validated.maNguoiDung}" đã tồn tại`);
    }

    // Kiểm tra email trùng
    const existingEmail = await nguoiDungRepository.findByEmail(validated.email);
    if (existingEmail) {
      throw new ConflictError(`Email "${validated.email}" đã được sử dụng`);
    }

    // Kiểm tra số điện thoại trùng
    if (validated.soDienThoai) {
      const existingPhone = await nguoiDungRepository.findByPhone(validated.soDienThoai);
      if (existingPhone) {
        throw new ConflictError(`Số điện thoại "${validated.soDienThoai}" đã được sử dụng`);
      }
    }

    // Kiểm tra vai trò tồn tại
    const vaiTro = await vaiTroRepository.findById(BigInt(validated.vaiTroId));
    if (!vaiTro) {
      throw new NotFoundError('Vai trò không tồn tại');
    }

    // Mã hóa mật khẩu
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(validated.matKhau, salt);

    const nguoiDung = await nguoiDungRepository.create({
      maNguoiDung: validated.maNguoiDung,
      hoTen: validated.hoTen,
      email: validated.email,
      soDienThoai: validated.soDienThoai || null,
      matKhau: hashedPassword,
      anhDaiDien: validated.anhDaiDien || null,
      trangThai: validated.trangThai || 'HOAT_DONG',
      vaiTro: {
        connect: { id: BigInt(validated.vaiTroId) },
      },
    });

    await nhatKyService.ghiNhatKy({
      nguoiDungId: currentUser.id,
      hanhDong: 'TAO',
      loaiDoiTuong: 'NGUOI_DUNG',
      doiTuongId: nguoiDung.id,
      duLieuMoi: nguoiDung,
    });

    return serializeBigInt(nguoiDung);
  }

  /**
   * Cập nhật thông tin người dùng
   */
  async update(id: string, data: unknown, currentUser: SessionUser) {
    const validated = validate(capNhatNguoiDungSchema, data) as CapNhatNguoiDungInput;
    const numId = BigInt(id);

    const existing = await nguoiDungRepository.findById(numId);
    if (!existing) {
      throw new NotFoundError('Không tìm thấy người dùng');
    }

    // Kiểm tra email trùng
    if (validated.email && validated.email !== existing.email) {
      const existingEmail = await nguoiDungRepository.findByEmail(validated.email);
      if (existingEmail && existingEmail.id !== numId) {
        throw new ConflictError(`Email "${validated.email}" đã được sử dụng`);
      }
    }

    // Kiểm tra số điện thoại trùng
    if (validated.soDienThoai && validated.soDienThoai !== existing.soDienThoai) {
      const existingPhone = await nguoiDungRepository.findByPhone(validated.soDienThoai);
      if (existingPhone && existingPhone.id !== numId) {
        throw new ConflictError(`Số điện thoại "${validated.soDienThoai}" đã được sử dụng`);
      }
    }

    // Kiểm tra vai trò nếu thay đổi
    if (validated.vaiTroId) {
      const vaiTro = await vaiTroRepository.findById(BigInt(validated.vaiTroId));
      if (!vaiTro) {
        throw new NotFoundError('Vai trò không tồn tại');
      }
    }

    const updateData: Prisma.NguoiDungUpdateInput = {};
    if (validated.hoTen !== undefined) updateData.hoTen = validated.hoTen;
    if (validated.email !== undefined) updateData.email = validated.email;
    if (validated.soDienThoai !== undefined) updateData.soDienThoai = validated.soDienThoai;
    if (validated.anhDaiDien !== undefined) updateData.anhDaiDien = validated.anhDaiDien;
    if (validated.trangThai !== undefined) updateData.trangThai = validated.trangThai;
    if (validated.vaiTroId !== undefined) {
      updateData.vaiTro = { connect: { id: BigInt(validated.vaiTroId) } };
    }

    const updated = await nguoiDungRepository.update(numId, updateData);

    await nhatKyService.ghiNhatKy({
      nguoiDungId: currentUser.id,
      hanhDong: 'CAP_NHAT',
      loaiDoiTuong: 'NGUOI_DUNG',
      doiTuongId: numId,
      duLieuCu: existing,
      duLieuMoi: updated,
    });

    return serializeBigInt(updated);
  }

  /**
   * Đổi mật khẩu
   */
  async doiMatKhau(id: string, data: unknown, currentUser: SessionUser) {
    // Chỉ chính người dùng đó hoặc Admin mới có quyền
    if (currentUser.id !== id && currentUser.maVaiTro !== 'ADMIN') {
      throw new UnauthorizedError('Bạn không có quyền đổi mật khẩu của người dùng khác');
    }

    const validated = validate(doiMatKhauSchema, data) as DoiMatKhauInput;
    const numId = BigInt(id);

    const userWithPassword = await nguoiDungRepository.findByIdWithPassword(numId);
    if (!userWithPassword) {
      throw new NotFoundError('Không tìm thấy người dùng');
    }

    const isMatch = await bcryptjs.compare(validated.matKhauCu, userWithPassword.matKhau);
    if (!isMatch) {
      throw new BusinessError('Mật khẩu cũ không chính xác');
    }

    const salt = await bcryptjs.genSalt(10);
    const newHashed = await bcryptjs.hash(validated.matKhauMoi, salt);

    await nguoiDungRepository.updatePassword(numId, newHashed);

    await nhatKyService.ghiNhatKy({
      nguoiDungId: currentUser.id,
      hanhDong: 'CAP_NHAT',
      loaiDoiTuong: 'NGUOI_DUNG',
      doiTuongId: numId,
    });

    return { message: 'Đổi mật khẩu thành công' };
  }

  /**
   * Xóa người dùng
   */
  async delete(id: string, currentUser: SessionUser) {
    const numId = BigInt(id);

    if (currentUser.id === id) {
      throw new BusinessError('Bạn không thể tự xóa tài khoản của chính mình');
    }

    const existing = await nguoiDungRepository.findById(numId);
    if (!existing) {
      throw new NotFoundError('Không tìm thấy người dùng');
    }

    if (existing._count.dangKyCas > 0 || existing._count.yeuCauThayDois > 0) {
      throw new BusinessError(
        'Không thể xóa người dùng đã có lịch sử đăng ký ca hoặc yêu cầu thay đổi lịch. Hãy chuyển trạng thái sang "Vô hiệu hóa" hoặc "Tạm khóa".'
      );
    }

    const deleted = await nguoiDungRepository.delete(numId);

    await nhatKyService.ghiNhatKy({
      nguoiDungId: currentUser.id,
      hanhDong: 'XOA',
      loaiDoiTuong: 'NGUOI_DUNG',
      doiTuongId: numId,
      duLieuCu: existing,
    });

    return serializeBigInt(deleted);
  }
}

export const nguoiDungService = new NguoiDungService();
