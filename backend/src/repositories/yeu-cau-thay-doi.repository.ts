// =========================================================
// Repository - Yêu cầu thay đổi lịch (Schedule Change Request)
// =========================================================

import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export class YeuCauThayDoiRepository {
  /**
   * Lấy danh sách yêu cầu với phân trang và bộ lọc
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.YeuCauThayDoiLichWhereInput;
    orderBy?: Prisma.YeuCauThayDoiLichOrderByWithRelationInput;
  }) {
    return prisma.yeuCauThayDoiLich.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: params.orderBy || { thoiGianYeuCau: 'desc' },
      include: {
        nguoiDung: {
          select: {
            id: true,
            maNguoiDung: true,
            hoTen: true,
            email: true,
            soDienThoai: true,
            anhDaiDien: true,
          },
        },
        caCu: {
          include: {
            caLamViec: true,
          },
        },
        caMoi: {
          include: {
            caLamViec: true,
          },
        },
        nguoiXuLy: {
          select: {
            id: true,
            hoTen: true,
          },
        },
        dangKyCa: true,
      },
    });
  }

  /**
   * Đếm số lượng yêu cầu
   */
  async count(where?: Prisma.YeuCauThayDoiLichWhereInput) {
    return prisma.yeuCauThayDoiLich.count({ where });
  }

  /**
   * Tìm yêu cầu theo ID
   */
  async findById(id: bigint) {
    return prisma.yeuCauThayDoiLich.findUnique({
      where: { id },
      include: {
        nguoiDung: {
          select: {
            id: true,
            maNguoiDung: true,
            hoTen: true,
            email: true,
            soDienThoai: true,
            anhDaiDien: true,
          },
        },
        caCu: {
          include: {
            caLamViec: true,
          },
        },
        caMoi: {
          include: {
            caLamViec: true,
          },
        },
        nguoiXuLy: {
          select: {
            id: true,
            hoTen: true,
          },
        },
        dangKyCa: true,
      },
    });
  }

  /**
   * Tạo yêu cầu mới
   */
  async create(data: Prisma.YeuCauThayDoiLichCreateInput) {
    return prisma.yeuCauThayDoiLich.create({
      data,
      include: {
        nguoiDung: {
          select: {
            id: true,
            hoTen: true,
          },
        },
        caCu: {
          include: { caLamViec: true },
        },
        caMoi: {
          include: { caLamViec: true },
        },
      },
    });
  }

  /**
   * Cập nhật yêu cầu
   */
  async update(id: bigint, data: Prisma.YeuCauThayDoiLichUpdateInput) {
    return prisma.yeuCauThayDoiLich.update({
      where: { id },
      data,
      include: {
        nguoiDung: {
          select: {
            id: true,
            hoTen: true,
          },
        },
        caCu: {
          include: { caLamViec: true },
        },
        caMoi: {
          include: { caLamViec: true },
        },
      },
    });
  }
}

export const yeuCauThayDoiRepository = new YeuCauThayDoiRepository();
