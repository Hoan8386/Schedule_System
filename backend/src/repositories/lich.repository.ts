// =========================================================
// Repository - Ca làm việc theo ngày (Lịch)
// =========================================================

import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export class LichRepository {
  /**
   * Lấy danh sách ca theo ngày với phân trang và bộ lọc
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.CaLamViecTheoNgayWhereInput;
    orderBy?: Prisma.CaLamViecTheoNgayOrderByWithRelationInput[];
  }) {
    return prisma.caLamViecTheoNgay.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: params.orderBy || [{ ngayLamViec: 'asc' }, { gioBatDau: 'asc' }],
      include: {
        caLamViec: {
          select: {
            id: true,
            maCa: true,
            tenCa: true,
            gioBatDau: true,
            gioKetThuc: true,
          },
        },
        kyDangKyLich: {
          select: {
            id: true,
            tenKy: true,
            nam: true,
            thang: true,
            trangThai: true,
          },
        },
        _count: {
          select: {
            dangKyCas: true,
          },
        },
        dangKyCas: {
          where: {
            trangThai: 'DA_DUYET',
          },
          select: {
            id: true,
            nguoiDungId: true,
            nguoiDung: {
              select: {
                id: true,
                hoTen: true,
                maNguoiDung: true,
                anhDaiDien: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Đếm số lượng ca theo ngày
   */
  async count(where?: Prisma.CaLamViecTheoNgayWhereInput) {
    return prisma.caLamViecTheoNgay.count({ where });
  }

  /**
   * Tìm ca theo ngày theo ID
   */
  async findById(id: bigint) {
    return prisma.caLamViecTheoNgay.findUnique({
      where: { id },
      include: {
        caLamViec: true,
        kyDangKyLich: true,
        dangKyCas: {
          include: {
            nguoiDung: {
              select: {
                id: true,
                hoTen: true,
                maNguoiDung: true,
                email: true,
                soDienThoai: true,
                anhDaiDien: true,
              },
            },
            nguoiDuyet: {
              select: {
                id: true,
                hoTen: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Tìm ca theo ngày theo caLamViecId và ngayLamViec
   */
  async findByCaAndDate(caLamViecId: bigint, ngayLamViec: Date) {
    return prisma.caLamViecTheoNgay.findUnique({
      where: {
        uk_ca_theo_ngay: {
          caLamViecId,
          ngayLamViec,
        },
      },
    });
  }

  /**
   * Tạo một ca theo ngày
   */
  async create(data: Prisma.CaLamViecTheoNgayCreateInput) {
    return prisma.caLamViecTheoNgay.create({
      data,
      include: {
        caLamViec: true,
      },
    });
  }

  /**
   * Tạo hàng loạt ca theo ngày
   */
  async createMany(data: Prisma.CaLamViecTheoNgayCreateManyInput[]) {
    return prisma.caLamViecTheoNgay.createMany({
      data,
      skipDuplicates: true,
    });
  }

  /**
   * Cập nhật ca theo ngày
   */
  async update(id: bigint, data: Prisma.CaLamViecTheoNgayUpdateInput) {
    return prisma.caLamViecTheoNgay.update({
      where: { id },
      data,
      include: {
        caLamViec: true,
      },
    });
  }

  /**
   * Xóa ca theo ngày
   */
  async delete(id: bigint) {
    return prisma.caLamViecTheoNgay.delete({
      where: { id },
    });
  }
}

export const lichRepository = new LichRepository();
