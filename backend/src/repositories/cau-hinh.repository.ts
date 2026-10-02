// =========================================================
// Repository - Cấu hình hệ thống (System Config)
// =========================================================

import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export class CauHinhRepository {
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.CauHinhHeThongWhereInput;
    orderBy?: Prisma.CauHinhHeThongOrderByWithRelationInput;
  }) {
    return prisma.cauHinhHeThong.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: params.orderBy || { maCauHinh: 'asc' },
    });
  }

  async count(where?: Prisma.CauHinhHeThongWhereInput) {
    return prisma.cauHinhHeThong.count({ where });
  }

  async findById(id: bigint) {
    return prisma.cauHinhHeThong.findUnique({
      where: { id },
    });
  }

  async findByCode(maCauHinh: string) {
    return prisma.cauHinhHeThong.findUnique({
      where: { maCauHinh },
    });
  }

  async update(id: bigint, data: Prisma.CauHinhHeThongUpdateInput) {
    return prisma.cauHinhHeThong.update({
      where: { id },
      data,
    });
  }
}

export const cauHinhRepository = new CauHinhRepository();
