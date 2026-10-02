// =========================================================
// Repository - Ca làm việc (Shift)
// =========================================================

import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export class CaLamViecRepository {
  /**
   * Lấy danh sách ca làm việc với phân trang
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.CaLamViecWhereInput;
    orderBy?: Prisma.CaLamViecOrderByWithRelationInput;
  }) {
    return prisma.caLamViec.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: params.orderBy || { thuTuHienThi: 'asc' },
      include: {
        _count: {
          select: {
            caTheoNgays: true,
          },
        },
      },
    });
  }

  /**
   * Đếm số lượng ca làm việc
   */
  async count(where?: Prisma.CaLamViecWhereInput) {
    return prisma.caLamViec.count({ where });
  }

  /**
   * Tìm ca làm việc theo ID
   */
  async findById(id: bigint) {
    return prisma.caLamViec.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            caTheoNgays: true,
          },
        },
      },
    });
  }

  /**
   * Tìm theo mã ca
   */
  async findByCode(maCa: string) {
    return prisma.caLamViec.findUnique({
      where: { maCa },
    });
  }

  /**
   * Tạo ca làm việc mới
   */
  async create(data: Prisma.CaLamViecCreateInput) {
    return prisma.caLamViec.create({
      data,
    });
  }

  /**
   * Cập nhật ca làm việc
   */
  async update(id: bigint, data: Prisma.CaLamViecUpdateInput) {
    return prisma.caLamViec.update({
      where: { id },
      data,
    });
  }

  /**
   * Xóa ca làm việc
   */
  async delete(id: bigint) {
    return prisma.caLamViec.delete({
      where: { id },
    });
  }
}

export const caLamViecRepository = new CaLamViecRepository();
