// =========================================================
// Repository - Nội quy lịch (Schedule Regulation)
// =========================================================

import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export class NoiQuyRepository {
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.NoiQuyLichWhereInput;
    orderBy?: Prisma.NoiQuyLichOrderByWithRelationInput;
  }) {
    return prisma.noiQuyLich.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: params.orderBy || { createdAt: 'desc' },
      include: {
        kyDangKyLich: {
          select: {
            id: true,
            tenKy: true,
          },
        },
        nguoiTao: {
          select: {
            id: true,
            hoTen: true,
          },
        },
      },
    });
  }

  async count(where?: Prisma.NoiQuyLichWhereInput) {
    return prisma.noiQuyLich.count({ where });
  }

  async findById(id: bigint) {
    return prisma.noiQuyLich.findUnique({
      where: { id },
      include: {
        kyDangKyLich: true,
        nguoiTao: {
          select: {
            id: true,
            hoTen: true,
          },
        },
      },
    });
  }

  async create(data: Prisma.NoiQuyLichCreateInput) {
    return prisma.noiQuyLich.create({
      data,
    });
  }

  async update(id: bigint, data: Prisma.NoiQuyLichUpdateInput) {
    return prisma.noiQuyLich.update({
      where: { id },
      data,
    });
  }

  async delete(id: bigint) {
    return prisma.noiQuyLich.delete({
      where: { id },
    });
  }
}

export const noiQuyRepository = new NoiQuyRepository();
