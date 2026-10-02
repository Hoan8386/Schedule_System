// =========================================================
// Repository - Vai trò
// =========================================================

import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export class VaiTroRepository {
  /**
   * Lấy danh sách vai trò với phân trang
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.VaiTroWhereInput;
    orderBy?: Prisma.VaiTroOrderByWithRelationInput;
  }) {
    return prisma.vaiTro.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: params.orderBy || { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            nguoiDungs: true,
            vaiTroQuyens: true,
          },
        },
      },
    });
  }

  /**
   * Đếm số lượng vai trò
   */
  async count(where?: Prisma.VaiTroWhereInput) {
    return prisma.vaiTro.count({ where });
  }

  /**
   * Tìm vai trò theo ID
   */
  async findById(id: bigint) {
    return prisma.vaiTro.findUnique({
      where: { id },
      include: {
        vaiTroQuyens: {
          include: {
            quyen: true,
          },
        },
        _count: {
          select: {
            nguoiDungs: true,
          },
        },
      },
    });
  }

  /**
   * Tìm vai trò theo mã
   */
  async findByMa(maVaiTro: string) {
    return prisma.vaiTro.findUnique({
      where: { maVaiTro },
    });
  }

  /**
   * Tạo vai trò mới
   */
  async create(data: Prisma.VaiTroCreateInput) {
    return prisma.vaiTro.create({
      data,
      include: {
        _count: {
          select: {
            nguoiDungs: true,
            vaiTroQuyens: true,
          },
        },
      },
    });
  }

  /**
   * Cập nhật vai trò
   */
  async update(id: bigint, data: Prisma.VaiTroUpdateInput) {
    return prisma.vaiTro.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            nguoiDungs: true,
            vaiTroQuyens: true,
          },
        },
      },
    });
  }

  /**
   * Xóa vai trò
   */
  async delete(id: bigint) {
    return prisma.vaiTro.delete({
      where: { id },
    });
  }

  /**
   * Gán quyền cho vai trò
   */
  async ganQuyen(vaiTroId: bigint, quyenIds: bigint[]) {
    // Xóa tất cả quyền cũ
    await prisma.vaiTroQuyen.deleteMany({
      where: { vaiTroId },
    });

    // Tạo quyền mới
    if (quyenIds.length > 0) {
      await prisma.vaiTroQuyen.createMany({
        data: quyenIds.map((quyenId) => ({
          vaiTroId,
          quyenId,
        })),
      });
    }

    // Trả về vai trò với quyền mới
    return this.findById(vaiTroId);
  }

  /**
   * Lấy danh sách quyền của vai trò
   */
  async getQuyenByVaiTroId(vaiTroId: bigint) {
    return prisma.vaiTroQuyen.findMany({
      where: { vaiTroId },
      include: { quyen: true },
    });
  }

  /**
   * Kiểm tra vai trò đang được sử dụng
   */
  async isInUse(vaiTroId: bigint): Promise<boolean> {
    const count = await prisma.nguoiDung.count({
      where: { vaiTroId },
    });
    return count > 0;
  }
}

export const vaiTroRepository = new VaiTroRepository();
