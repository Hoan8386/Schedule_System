// =========================================================
// Service - Yêu cầu thay đổi lịch (Schedule Change Request)
// =========================================================

import prisma from '@/lib/prisma';
import { yeuCauThayDoiRepository } from '@/repositories/yeu-cau-thay-doi.repository';
import { dangKyCaRepository } from '@/repositories/dang-ky-ca.repository';
import { lichRepository } from '@/repositories/lich.repository';
import { thongBaoService } from '@/services/thong-bao.service';
import { nhatKyService } from '@/services/nhat-ky.service';
import { NotFoundError, BusinessError, UnauthorizedError } from '@/lib/errors';
import { calculateSkip, calculatePaginationMeta, serializeBigInt } from '@/lib/utils';
import { validate } from '@/middleware/validation.middleware';
import {
  taoYeuCauSchema,
  duyetYeuCauSchema,
  tuChoiYeuCauSchema,
} from '@/validators/yeu-cau-thay-doi.validator';
import type {
  TaoYeuCauInput,
  DuyetYeuCauInput,
  TuChoiYeuCauInput,
} from '@/validators/yeu-cau-thay-doi.validator';
import type { PaginationQuery, PaginatedResult, SessionUser } from '@/types';
import type { Prisma } from '@prisma/client';

export class YeuCauThayDoiService {
  /**
   * Lấy danh sách yêu cầu thay đổi
   */
  async getAll(
    query: PaginationQuery & {
      nguoiDungId?: string;
      loaiYeuCau?: string;
      trangThai?: string;
    },
    currentUser: SessionUser
  ): Promise<PaginatedResult<unknown>> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = calculateSkip(page, limit);

    const where: Prisma.YeuCauThayDoiLichWhereInput = {};

    const isManager = currentUser.maVaiTro === 'ADMIN' || currentUser.maVaiTro === 'QUAN_LY';
    if (!isManager) {
      where.nguoiDungId = BigInt(currentUser.id);
    } else if (query.nguoiDungId) {
      where.nguoiDungId = BigInt(query.nguoiDungId);
    }

    if (query.loaiYeuCau) {
      where.loaiYeuCau = query.loaiYeuCau;
    }
    if (query.trangThai) {
      where.trangThai = query.trangThai;
    }

    const [data, total] = await Promise.all([
      yeuCauThayDoiRepository.findMany({ skip, take: limit, where }),
      yeuCauThayDoiRepository.count(where),
    ]);

    return {
      data: serializeBigInt(data),
      meta: calculatePaginationMeta(total, page, limit),
    };
  }

  /**
   * Lấy chi tiết yêu cầu thay đổi
   */
  async getById(id: string, currentUser: SessionUser) {
    const item = await yeuCauThayDoiRepository.findById(BigInt(id));
    if (!item) {
      throw new NotFoundError('Không tìm thấy yêu cầu thay đổi');
    }

    const isManager = currentUser.maVaiTro === 'ADMIN' || currentUser.maVaiTro === 'QUAN_LY';
    if (!isManager && item.nguoiDungId !== BigInt(currentUser.id)) {
      throw new UnauthorizedError('Bạn không có quyền xem yêu cầu này');
    }

    return serializeBigInt(item);
  }

  /**
   * Tạo yêu cầu thay đổi lịch
   */
  async create(data: unknown, currentUser: SessionUser) {
    const validated = validate(taoYeuCauSchema, data) as TaoYeuCauInput;
    const userId = BigInt(currentUser.id);

    // Kiểm tra tính hợp lệ tùy loại yêu cầu
    if (validated.loaiYeuCau === 'DOI_CA') {
      if (!validated.dangKyCaId || !validated.caMoiId) {
        throw new BusinessError('Yêu cầu đổi ca cần chỉ định ca hiện tại và ca muốn đổi sang');
      }
    } else if (validated.loaiYeuCau === 'HUY_CA') {
      if (!validated.dangKyCaId) {
        throw new BusinessError('Yêu cầu hủy ca cần chỉ định ca muốn hủy');
      }
    } else if (validated.loaiYeuCau === 'THEM_CA') {
      if (!validated.caMoiId) {
        throw new BusinessError('Yêu cầu thêm ca cần chỉ định ca muốn đăng ký thêm');
      }
    }

    let dangKyCaId: bigint | null = null;
    let caCuId: bigint | null = null;
    let caMoiId: bigint | null = null;

    if (validated.dangKyCaId) {
      dangKyCaId = BigInt(validated.dangKyCaId);
      const reg = await dangKyCaRepository.findById(dangKyCaId);
      if (!reg) throw new NotFoundError('Không tìm thấy bản ghi ca làm việc hiện tại');
      if (reg.nguoiDungId !== userId) {
        throw new UnauthorizedError('Bạn không thể gửi yêu cầu cho ca làm việc của người khác');
      }
      caCuId = reg.caLamViecTheoNgayId;
    }

    if (validated.caMoiId) {
      caMoiId = BigInt(validated.caMoiId);
      const newShift = await lichRepository.findById(caMoiId);
      if (!newShift) throw new NotFoundError('Không tìm thấy ca làm việc mới');
      if (newShift.trangThai !== 'MO') {
        throw new BusinessError('Ca làm việc mới hiện không mở nhận thêm người');
      }
    }

    const item = await yeuCauThayDoiRepository.create({
      nguoiDung: { connect: { id: userId } },
      loaiYeuCau: validated.loaiYeuCau,
      lyDo: validated.lyDo,
      trangThai: 'CHO_DUYET',
      ...(dangKyCaId && { dangKyCa: { connect: { id: dangKyCaId } } }),
      ...(caCuId && { caCu: { connect: { id: caCuId } } }),
      ...(caMoiId && { caMoi: { connect: { id: caMoiId } } }),
    });

    await nhatKyService.ghiNhatKy({
      nguoiDungId: currentUser.id,
      hanhDong: 'TAO_YEU_CAU',
      loaiDoiTuong: 'YEU_CAU_THAY_DOI',
      doiTuongId: item.id,
      duLieuMoi: item,
    });

    return serializeBigInt(item);
  }

  /**
   * Duyệt yêu cầu thay đổi lịch
   */
  async duyet(id: string, data: unknown, currentUser: SessionUser) {
    const validated = validate(duyetYeuCauSchema, data) as DuyetYeuCauInput;
    const numId = BigInt(id);

    const req = await yeuCauThayDoiRepository.findById(numId);
    if (!req) {
      throw new NotFoundError('Không tìm thấy yêu cầu thay đổi');
    }

    if (req.trangThai !== 'CHO_DUYET') {
      throw new BusinessError('Yêu cầu này đã được xử lý trước đó');
    }

    // Thực hiện trong transaction
    await prisma.$transaction(async (tx) => {
      // 1. Cập nhật yêu cầu
      await tx.yeuCauThayDoiLich.update({
        where: { id: numId },
        data: {
          trangThai: 'DA_DUYET',
          thoiGianXuLy: new Date(),
          nguoiXuLyId: BigInt(currentUser.id),
          ghiChuXuLy: validated.ghiChuXuLy ?? null,
        },
      });

      // 2. Thực hiện đổi / hủy / thêm ca
      if (req.loaiYeuCau === 'DOI_CA') {
        if (req.dangKyCaId && req.caMoiId) {
          // Hủy ca cũ
          await tx.dangKyCa.update({
            where: { id: req.dangKyCaId },
            data: { trangThai: 'DA_HUY' },
          });

          // Đăng ký ca mới
          await tx.dangKyCa.upsert({
            where: {
              uk_dang_ky_ca: {
                nguoiDungId: req.nguoiDungId,
                caLamViecTheoNgayId: req.caMoiId,
              },
            },
            update: {
              trangThai: 'DA_DUYET',
              thoiGianDuyet: new Date(),
              nguoiDuyetId: BigInt(currentUser.id),
            },
            create: {
              nguoiDungId: req.nguoiDungId,
              caLamViecTheoNgayId: req.caMoiId,
              trangThai: 'DA_DUYET',
              thoiGianDangKy: new Date(),
              thoiGianDuyet: new Date(),
              nguoiDuyetId: BigInt(currentUser.id),
            },
          });

          // Ghi lịch sử
          await tx.lichSuThayDoiLich.create({
            data: {
              nguoiDungId: req.nguoiDungId,
              dangKyCaId: req.dangKyCaId,
              hanhDong: 'DOI_CA',
              caCuId: req.caCuId,
              caMoiId: req.caMoiId,
              lyDo: req.lyDo,
              nguoiThayDoiId: BigInt(currentUser.id),
            },
          });
        }
      } else if (req.loaiYeuCau === 'HUY_CA') {
        if (req.dangKyCaId) {
          await tx.dangKyCa.update({
            where: { id: req.dangKyCaId },
            data: { trangThai: 'DA_HUY' },
          });

          await tx.lichSuThayDoiLich.create({
            data: {
              nguoiDungId: req.nguoiDungId,
              dangKyCaId: req.dangKyCaId,
              hanhDong: 'HUY_CA',
              caCuId: req.caCuId,
              lyDo: req.lyDo,
              nguoiThayDoiId: BigInt(currentUser.id),
            },
          });
        }
      } else if (req.loaiYeuCau === 'THEM_CA') {
        if (req.caMoiId) {
          const newReg = await tx.dangKyCa.upsert({
            where: {
              uk_dang_ky_ca: {
                nguoiDungId: req.nguoiDungId,
                caLamViecTheoNgayId: req.caMoiId,
              },
            },
            update: {
              trangThai: 'DA_DUYET',
              thoiGianDuyet: new Date(),
              nguoiDuyetId: BigInt(currentUser.id),
            },
            create: {
              nguoiDungId: req.nguoiDungId,
              caLamViecTheoNgayId: req.caMoiId,
              trangThai: 'DA_DUYET',
              thoiGianDangKy: new Date(),
              thoiGianDuyet: new Date(),
              nguoiDuyetId: BigInt(currentUser.id),
            },
          });

          await tx.lichSuThayDoiLich.create({
            data: {
              nguoiDungId: req.nguoiDungId,
              dangKyCaId: newReg.id,
              hanhDong: 'THEM_CA',
              caMoiId: req.caMoiId,
              lyDo: req.lyDo,
              nguoiThayDoiId: BigInt(currentUser.id),
            },
          });
        }
      }
    });

    // Thông báo cho nhân viên
    await thongBaoService.taoThongBao({
      nguoiDungId: req.nguoiDungId,
      loaiThongBao: 'YEU_CAU_DOI_CA_DUOC_DUYET',
      tieuDe: 'Yêu cầu thay đổi lịch đã được duyệt',
      noiDung: `Yêu cầu (${req.loaiYeuCau}) của bạn đã được ${currentUser.hoTen} phê duyệt thành công.`,
      loaiDoiTuongThamChieu: 'YEU_CAU_THAY_DOI',
      doiTuongThamChieuId: numId,
    });

    await nhatKyService.ghiNhatKy({
      nguoiDungId: currentUser.id,
      hanhDong: 'DUYET_YEU_CAU',
      loaiDoiTuong: 'YEU_CAU_THAY_DOI',
      doiTuongId: numId,
    });

    const updated = await yeuCauThayDoiRepository.findById(numId);
    return serializeBigInt(updated);
  }

  /**
   * Từ chối yêu cầu thay đổi lịch
   */
  async tuChoi(id: string, data: unknown, currentUser: SessionUser) {
    const validated = validate(tuChoiYeuCauSchema, data) as TuChoiYeuCauInput;
    const numId = BigInt(id);

    const req = await yeuCauThayDoiRepository.findById(numId);
    if (!req) {
      throw new NotFoundError('Không tìm thấy yêu cầu thay đổi');
    }

    if (req.trangThai !== 'CHO_DUYET') {
      throw new BusinessError('Yêu cầu này đã được xử lý trước đó');
    }

    const updated = await yeuCauThayDoiRepository.update(numId, {
      trangThai: 'TU_CHOI',
      thoiGianXuLy: new Date(),
      nguoiXuLy: { connect: { id: BigInt(currentUser.id) } },
      ghiChuXuLy: validated.ghiChuXuLy,
    });

    // Thông báo cho nhân viên
    await thongBaoService.taoThongBao({
      nguoiDungId: req.nguoiDungId,
      loaiThongBao: 'YEU_CAU_DOI_CA_BI_TU_CHOI',
      tieuDe: 'Yêu cầu thay đổi lịch bị từ chối',
      noiDung: `Yêu cầu (${req.loaiYeuCau}) của bạn đã bị từ chối. Ghi chú: ${validated.ghiChuXuLy}`,
      loaiDoiTuongThamChieu: 'YEU_CAU_THAY_DOI',
      doiTuongThamChieuId: numId,
    });

    await nhatKyService.ghiNhatKy({
      nguoiDungId: currentUser.id,
      hanhDong: 'TU_CHOI_YEU_CAU',
      loaiDoiTuong: 'YEU_CAU_THAY_DOI',
      doiTuongId: numId,
      duLieuCu: req,
      duLieuMoi: updated,
    });

    return serializeBigInt(updated);
  }
}

export const yeuCauThayDoiService = new YeuCauThayDoiService();
