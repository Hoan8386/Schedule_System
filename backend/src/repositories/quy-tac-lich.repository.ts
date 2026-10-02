// =========================================================
// Repository - Quy tắc lịch (Schedule Rule)
// =========================================================

import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export class QuyTacLichRepository {
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.QuyTacLichWhereInput;
    orderBy?: Prisma.QuyTacLichOrderByWithRelationInput;
  }) {
    return prisma.quyTacLich.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: params.orderBy || { maQuyTac: 'asc' },
      include: {
        kyDangKyLich: {
          select: {
            id: true,
            tenKy: true,
          },
        },
      },
    });
  }

  async count(where?: Prisma.QuyTacLichWhereInput) {
    return prisma.quyTacLich.count({ where });
  }

  async findById(id: bigint) {
    return prisma.quyTacLich.findUnique({
      where: { id },
      include: {
        kyDangKyLich: true,
      },
    });
  }

  async create(data: Prisma.QuyTacLichCreateInput) {
    return prisma.quyTacLich.create({
      data,
    });
  }

  async update(id: bigint, data: Prisma.QuyTacLichUpdateInput) {
    return prisma.quyTacLich.update({
      where: { id },
      data,
    });
  }

  async delete(id: bigint) {
    return prisma.quyTacLich.delete({
      where: { id },
    });
  }
}

export const quyTacLichRepository = new QuyTacLichRepository();
