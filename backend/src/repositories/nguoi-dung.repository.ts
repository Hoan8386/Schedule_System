// =========================================================
// Repository - Người dùng (User)
// =========================================================

import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export class NguoiDungRepository {
  /**
   * Lấy danh sách người dùng với phân trang
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.NguoiDungWhereInput;
    orderBy?: Prisma.NguoiDungOrderByWithRelationInput;
  }) {
    return prisma.nguoiDung.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: params.orderBy || { createdAt: 'desc' },
      select: {
        id: true,
        maNguoiDung: true,
        hoTen: true,
        email: true,
        soDienThoai: true,
        anhDaiDien: true,
        vaiTroId: true,
        trangThai: true,
        lanDangNhapCuoi: true,
        createdAt: true,
        updatedAt: true,
        vaiTro: {
          select: {
            id: true,
            maVaiTro: true,
            tenVaiTro: true,
          },
        },
      },
    });
  }

  /**
   * Đếm số lượng người dùng
   */
  async count(where?: Prisma.NguoiDungWhereInput) {
    return prisma.nguoiDung.count({ where });
  }

  /**
   * Tìm người dùng theo ID (không kèm mật khẩu)
   */
  async findById(id: bigint) {
    return prisma.nguoiDung.findUnique({
      where: { id },
      select: {
        id: true,
        maNguoiDung: true,
        hoTen: true,
        email: true,
        soDienThoai: true,
        anhDaiDien: true,
        vaiTroId: true,
        trangThai: true,
        lanDangNhapCuoi: true,
        createdAt: true,
        updatedAt: true,
        vaiTro: {
          select: {
            id: true,
            maVaiTro: true,
            tenVaiTro: true,
          },
        },
        _count: {
          select: {
            dangKyCas: true,
            yeuCauThayDois: true,
          },
        },
      },
    });
  }

  /**
   * Tìm người dùng kèm mật khẩu (dùng cho xác thực / đổi mật khẩu)
   */
  async findByIdWithPassword(id: bigint) {
    return prisma.nguoiDung.findUnique({
      where: { id },
    });
  }

  /**
   * Tìm theo mã người dùng
   */
  async findByCode(maNguoiDung: string) {
    return prisma.nguoiDung.findUnique({
      where: { maNguoiDung },
    });
  }

  /**
   * Tìm theo email
   */
  async findByEmail(email: string) {
    return prisma.nguoiDung.findUnique({
      where: { email },
    });
  }

  /**
   * Tìm theo số điện thoại
   */
  async findByPhone(soDienThoai: string) {
    return prisma.nguoiDung.findUnique({
      where: { soDienThoai },
    });
  }

  /**
   * Tạo người dùng mới
   */
  async create(data: Prisma.NguoiDungCreateInput) {
    return prisma.nguoiDung.create({
      data,
      select: {
        id: true,
        maNguoiDung: true,
        hoTen: true,
        email: true,
        soDienThoai: true,
        anhDaiDien: true,
        vaiTroId: true,
        trangThai: true,
        createdAt: true,
        updatedAt: true,
        vaiTro: {
          select: {
            id: true,
            maVaiTro: true,
            tenVaiTro: true,
          },
        },
      },
    });
  }

  /**
   * Cập nhật người dùng
   */
  async update(id: bigint, data: Prisma.NguoiDungUpdateInput) {
    return prisma.nguoiDung.update({
      where: { id },
      data,
      select: {
        id: true,
        maNguoiDung: true,
        hoTen: true,
        email: true,
        soDienThoai: true,
        anhDaiDien: true,
        vaiTroId: true,
        trangThai: true,
        createdAt: true,
        updatedAt: true,
        vaiTro: {
          select: {
            id: true,
            maVaiTro: true,
            tenVaiTro: true,
          },
        },
      },
    });
  }

  /**
   * Cập nhật mật khẩu
   */
  async updatePassword(id: bigint, matKhauMoiHash: string) {
    return prisma.nguoiDung.update({
      where: { id },
      data: {
        matKhau: matKhauMoiHash,
      },
    });
  }

  /**
   * Xóa người dùng
   */
  async delete(id: bigint) {
    return prisma.nguoiDung.delete({
      where: { id },
    });
  }
}

export const nguoiDungRepository = new NguoiDungRepository();
