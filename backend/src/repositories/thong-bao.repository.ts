// =========================================================
// Repository - Thông báo (Notification)
// =========================================================

import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export class ThongBaoRepository {
  /**
   * Lấy danh sách thông báo theo người dùng với phân trang
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ThongBaoWhereInput;
    orderBy?: Prisma.ThongBaoOrderByWithRelationInput;
  }) {
    return prisma.thongBao.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: params.orderBy || { createdAt: 'desc' },
    });
  }

  /**
   * Đếm số lượng thông báo
   */
  async count(where?: Prisma.ThongBaoWhereInput) {
    return prisma.thongBao.count({ where });
  }

  /**
   * Đếm thông báo chưa đọc của người dùng
   */
  async countUnread(nguoiDungId: bigint) {
    return prisma.thongBao.count({
      where: {
        nguoiDungId,
        daDoc: false,
      },
    });
  }

  /**
   * Tìm thông báo theo ID
   */
  async findById(id: bigint) {
    return prisma.thongBao.findUnique({
      where: { id },
    });
  }

  /**
   * Tạo thông báo mới
   */
  async create(data: Prisma.ThongBaoCreateInput) {
    return prisma.thongBao.create({
      data,
    });
  }

  /**
   * Đánh dấu đã đọc
   */
  async markAsRead(id: bigint) {
    return prisma.thongBao.update({
      where: { id },
      data: {
        daDoc: true,
        thoiGianDoc: new Date(),
      },
    });
  }

  /**
   * Đánh dấu tất cả đã đọc cho một người dùng
   */
  async markAllAsRead(nguoiDungId: bigint) {
    return prisma.thongBao.updateMany({
      where: {
        nguoiDungId,
        daDoc: false,
      },
      data: {
        daDoc: true,
        thoiGianDoc: new Date(),
      },
    });
  }
}

export const thongBaoRepository = new ThongBaoRepository();
