// =========================================================
// Repository - Quyền (Permission)
// =========================================================

import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export class QuyenRepository {
  /**
   * Lấy danh sách quyền với phân trang
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.QuyenWhereInput;
    orderBy?: Prisma.QuyenOrderByWithRelationInput;
  }) {
    return prisma.quyen.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: params.orderBy || { maQuyen: 'asc' },
      include: {
        _count: {
          select: {
            vaiTroQuyens: true,
          },
        },
      },
    });
  }

  /**
   * Đếm số lượng quyền
   */
  async count(where?: Prisma.QuyenWhereInput) {
    return prisma.quyen.count({ where });
  }

  /**
   * Tìm quyền theo ID
   */
  async findById(id: bigint) {
    return prisma.quyen.findUnique({
      where: { id },
      include: {
        vaiTroQuyens: {
          include: {
            vaiTro: true,
          },
        },
      },
    });
  }

  /**
   * Tìm quyền theo mã
   */
  async findByCode(maQuyen: string) {
    return prisma.quyen.findUnique({
      where: { maQuyen },
    });
  }

  /**
   * Tìm quyền theo API path và HTTP method
   */
  async findByApiAndMethod(apiPath: string, httpMethod: string) {
    return prisma.quyen.findUnique({
      where: {
        uk_quyen_api: {
          apiPath,
          httpMethod,
        },
      },
    });
  }

  /**
   * Tạo quyền mới
   */
  async create(data: Prisma.QuyenCreateInput) {
    return prisma.quyen.create({
      data,
    });
  }

  /**
   * Cập nhật quyền
   */
  async update(id: bigint, data: Prisma.QuyenUpdateInput) {
    return prisma.quyen.update({
      where: { id },
      data,
    });
  }

  /**
   * Xóa quyền
   */
  async delete(id: bigint) {
    return prisma.quyen.delete({
      where: { id },
    });
  }
}

export const quyenRepository = new QuyenRepository();
