// =========================================================
// Repository - Kỳ đăng ký lịch (Registration Period)
// =========================================================

import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export class KyDangKyRepository {
  /**
   * Lấy danh sách kỳ đăng ký với phân trang
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.KyDangKyLichWhereInput;
    orderBy?: Prisma.KyDangKyLichOrderByWithRelationInput;
  }) {
    return prisma.kyDangKyLich.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: params.orderBy || [{ nam: 'desc' }, { thang: 'desc' }],
      include: {
        nguoiTao: {
          select: {
            id: true,
            hoTen: true,
            maNguoiDung: true,
          },
        },
        _count: {
          select: {
            caTheoNgays: true,
            quyTacLichs: true,
            noiQuyLichs: true,
          },
        },
      },
    });
  }

  /**
   * Đếm số lượng kỳ đăng ký
   */
  async count(where?: Prisma.KyDangKyLichWhereInput) {
    return prisma.kyDangKyLich.count({ where });
  }

  /**
   * Tìm kỳ đăng ký theo ID
   */
  async findById(id: bigint) {
    return prisma.kyDangKyLich.findUnique({
      where: { id },
      include: {
        nguoiTao: {
          select: {
            id: true,
            hoTen: true,
            maNguoiDung: true,
          },
        },
        _count: {
          select: {
            caTheoNgays: true,
            quyTacLichs: true,
            noiQuyLichs: true,
          },
        },
      },
    });
  }

  /**
   * Tìm theo năm và tháng
   */
  async findByYearAndMonth(nam: number, thang: number) {
    return prisma.kyDangKyLich.findUnique({
      where: {
        uk_ky_dang_ky_lich_nam_thang: {
          nam,
          thang,
        },
      },
    });
  }

  /**
   * Lấy kỳ đăng ký đang mở hiện tại
   */
  async findCurrentOpen() {
    const now = new Date();
    return prisma.kyDangKyLich.findFirst({
      where: {
        trangThai: 'MO_DANG_KY',
        OR: [
          {
            AND: [
              { thoiGianMoDangKy: { lte: now } },
              { thoiGianDongDangKy: { gte: now } },
            ],
          },
          {
            thoiGianMoDangKy: null,
            thoiGianDongDangKy: null,
          },
        ],
      },
      include: {
        nguoiTao: {
          select: {
            id: true,
            hoTen: true,
          },
        },
      },
    });
  }

  /**
   * Tạo kỳ đăng ký mới
   */
  async create(data: Prisma.KyDangKyLichCreateInput) {
    return prisma.kyDangKyLich.create({
      data,
      include: {
        nguoiTao: {
          select: {
            id: true,
            hoTen: true,
            maNguoiDung: true,
          },
        },
      },
    });
  }

  /**
   * Cập nhật kỳ đăng ký
   */
  async update(id: bigint, data: Prisma.KyDangKyLichUpdateInput) {
    return prisma.kyDangKyLich.update({
      where: { id },
      data,
      include: {
        nguoiTao: {
          select: {
            id: true,
            hoTen: true,
            maNguoiDung: true,
          },
        },
      },
    });
  }

  /**
   * Xóa kỳ đăng ký
   */
  async delete(id: bigint) {
    return prisma.kyDangKyLich.delete({
      where: { id },
    });
  }
}

export const kyDangKyRepository = new KyDangKyRepository();
