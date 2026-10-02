// =========================================================
// Repository - Ngày lễ (Holiday)
// =========================================================

import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export class NgayLeRepository {
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.NgayLeWhereInput;
    orderBy?: Prisma.NgayLeOrderByWithRelationInput;
  }) {
    return prisma.ngayLe.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: params.orderBy || { ngay: 'asc' },
    });
  }

  async count(where?: Prisma.NgayLeWhereInput) {
    return prisma.ngayLe.count({ where });
  }

  async findById(id: bigint) {
    return prisma.ngayLe.findUnique({
      where: { id },
    });
  }

  async findByDate(ngay: Date) {
    return prisma.ngayLe.findUnique({
      where: { ngay },
    });
  }

  async create(data: Prisma.NgayLeCreateInput) {
    return prisma.ngayLe.create({
      data,
    });
  }

  async update(id: bigint, data: Prisma.NgayLeUpdateInput) {
    return prisma.ngayLe.update({
      where: { id },
      data,
    });
  }

  async delete(id: bigint) {
    return prisma.ngayLe.delete({
      where: { id },
    });
  }
}

export const ngayLeRepository = new NgayLeRepository();
