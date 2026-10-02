// =========================================================
// Repository - Đăng ký ca làm việc (Shift Registration)
// =========================================================

import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export class DangKyCaRepository {
  /**
   * Lấy danh sách đăng ký ca với phân trang và bộ lọc
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.DangKyCaWhereInput;
    orderBy?: Prisma.DangKyCaOrderByWithRelationInput;
  }) {
    return prisma.dangKyCa.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: params.orderBy || { thoiGianDangKy: 'desc' },
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
        caLamViecTheoNgay: {
          include: {
            caLamViec: true,
            kyDangKyLich: {
              select: {
                id: true,
                tenKy: true,
                nam: true,
                thang: true,
                trangThai: true,
              },
            },
          },
        },
        nguoiDuyet: {
          select: {
            id: true,
            hoTen: true,
          },
        },
        nguoiTuChoi: {
          select: {
            id: true,
            hoTen: true,
          },
        },
      },
    });
  }

  /**
   * Đếm số lượng đăng ký ca
   */
  async count(where?: Prisma.DangKyCaWhereInput) {
    return prisma.dangKyCa.count({ where });
  }

  /**
   * Tìm đăng ký ca theo ID
   */
  async findById(id: bigint) {
    return prisma.dangKyCa.findUnique({
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
        caLamViecTheoNgay: {
          include: {
            caLamViec: true,
            kyDangKyLich: true,
          },
        },
        nguoiDuyet: {
          select: {
            id: true,
            hoTen: true,
          },
        },
        nguoiTuChoi: {
          select: {
            id: true,
            hoTen: true,
          },
        },
      },
    });
  }

  /**
   * Tìm bản ghi đăng ký của người dùng cho một ca cụ thể
   */
  async findByUserAndShift(nguoiDungId: bigint, caLamViecTheoNgayId: bigint) {
    return prisma.dangKyCa.findUnique({
      where: {
        uk_dang_ky_ca: {
          nguoiDungId,
          caLamViecTheoNgayId,
        },
      },
    });
  }

  /**
   * Đếm số lượng đã duyệt của ca này
   */
  async countApprovedByShift(caLamViecTheoNgayId: bigint) {
    return prisma.dangKyCa.count({
      where: {
        caLamViecTheoNgayId,
        trangThai: 'DA_DUYET',
      },
    });
  }

  /**
   * Tìm các ca người dùng đã đăng ký trong một ngày cụ thể (để kiểm tra xung đột thời gian)
   */
  async findUserApprovedRegistrationsOnDate(nguoiDungId: bigint, ngayLamViec: Date) {
    return prisma.dangKyCa.findMany({
      where: {
        nguoiDungId,
        trangThai: { in: ['DA_DUYET', 'CHO_DUYET'] },
        caLamViecTheoNgay: {
          ngayLamViec,
        },
      },
      include: {
        caLamViecTheoNgay: true,
      },
    });
  }

  /**
   * Tạo bản ghi đăng ký ca
   */
  async create(data: Prisma.DangKyCaCreateInput) {
    return prisma.dangKyCa.create({
      data,
      include: {
        nguoiDung: {
          select: {
            id: true,
            maNguoiDung: true,
            hoTen: true,
          },
        },
        caLamViecTheoNgay: {
          include: {
            caLamViec: true,
          },
        },
      },
    });
  }

  /**
   * Cập nhật bản ghi đăng ký ca
   */
  async update(id: bigint, data: Prisma.DangKyCaUpdateInput) {
    return prisma.dangKyCa.update({
      where: { id },
      data,
      include: {
        nguoiDung: {
          select: {
            id: true,
            maNguoiDung: true,
            hoTen: true,
          },
        },
        caLamViecTheoNgay: {
          include: {
            caLamViec: true,
          },
        },
      },
    });
  }

  /**
   * Xóa bản ghi đăng ký ca
   */
  async delete(id: bigint) {
    return prisma.dangKyCa.delete({
      where: { id },
    });
  }
}

export const dangKyCaRepository = new DangKyCaRepository();
