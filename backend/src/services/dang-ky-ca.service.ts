// =========================================================
// Service - Đăng ký ca làm việc (Shift Registration)
// =========================================================

import prisma from '@/lib/prisma';
import { dangKyCaRepository } from '@/repositories/dang-ky-ca.repository';
import { lichRepository } from '@/repositories/lich.repository';
import { thongBaoService } from '@/services/thong-bao.service';
import { nhatKyService } from '@/services/nhat-ky.service';
import { NotFoundError, ConflictError, BusinessError, UnauthorizedError } from '@/lib/errors';
import { calculateSkip, calculatePaginationMeta, serializeBigInt } from '@/lib/utils';
import { validate } from '@/middleware/validation.middleware';
import {
  dangKyCaSchema,
  duyetDangKySchema,
  tuChoiDangKySchema,
} from '@/validators/dang-ky-ca.validator';
import type {
  DangKyCaInput,
  DuyetDangKyInput,
  TuChoiDangKyInput,
} from '@/validators/dang-ky-ca.validator';
import type { PaginationQuery, PaginatedResult, SessionUser } from '@/types';
import type { Prisma } from '@prisma/client';

function formatRegistrationData(item: unknown): unknown {
  if (!item || typeof item !== 'object') return item;
  const reg = { ...(item as Record<string, unknown>) };
  if (reg.caLamViecTheoNgay && typeof reg.caLamViecTheoNgay === 'object') {
    const clv = { ...(reg.caLamViecTheoNgay as Record<string, unknown>) };
    if (clv.ngayLamViec instanceof Date) {
      clv.ngayLamViec = clv.ngayLamViec.toISOString().substring(0, 10);
    }
    if (clv.gioBatDau instanceof Date) {
      clv.gioBatDau = clv.gioBatDau.toISOString().substring(11, 16);
    }
    if (clv.gioKetThuc instanceof Date) {
      clv.gioKetThuc = clv.gioKetThuc.toISOString().substring(11, 16);
    }
    reg.caLamViecTheoNgay = clv;
  }
  return reg;
}

export class DangKyCaService {
  /**
   * Lấy danh sách đăng ký ca
   */
  async getAll(
    query: PaginationQuery & {
      nguoiDungId?: string;
      caLamViecTheoNgayId?: string;
      kyDangKyLichId?: string;
      trangThai?: string;
      tuNgay?: string;
      denNgay?: string;
    },
    currentUser: SessionUser
  ): Promise<PaginatedResult<unknown>> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = calculateSkip(page, limit);

    const where: Prisma.DangKyCaWhereInput = {};

    // Nhân viên thông thường chỉ xem được đăng ký của chính mình trừ khi là Admin/Quản lý
    const isManager = currentUser.maVaiTro === 'ADMIN' || currentUser.maVaiTro === 'QUAN_LY';
    if (!isManager) {
      where.nguoiDungId = BigInt(currentUser.id);
    } else if (query.nguoiDungId) {
      where.nguoiDungId = BigInt(query.nguoiDungId);
    }

    if (query.caLamViecTheoNgayId) {
      where.caLamViecTheoNgayId = BigInt(query.caLamViecTheoNgayId);
    }

    if (query.trangThai) {
      where.trangThai = query.trangThai;
    }

    if (query.kyDangKyLichId || query.tuNgay || query.denNgay) {
      where.caLamViecTheoNgay = {};
      if (query.kyDangKyLichId) {
        where.caLamViecTheoNgay.kyDangKyLichId = BigInt(query.kyDangKyLichId);
      }
      if (query.tuNgay || query.denNgay) {
        where.caLamViecTheoNgay.ngayLamViec = {};
        if (query.tuNgay) {
          where.caLamViecTheoNgay.ngayLamViec.gte = new Date(query.tuNgay);
        }
        if (query.denNgay) {
          where.caLamViecTheoNgay.ngayLamViec.lte = new Date(query.denNgay);
        }
      }
    }

    const [data, total] = await Promise.all([
      dangKyCaRepository.findMany({ skip, take: limit, where }),
      dangKyCaRepository.count(where),
    ]);

    const formatted = data.map((d) => formatRegistrationData(d));

    return {
      data: serializeBigInt(formatted),
      meta: calculatePaginationMeta(total, page, limit),
    };
  }

  /**
   * Lấy chi tiết đăng ký ca
   */
  async getById(id: string, currentUser: SessionUser) {
    const item = await dangKyCaRepository.findById(BigInt(id));
    if (!item) {
      throw new NotFoundError('Không tìm thấy bản ghi đăng ký ca');
    }

    const isManager = currentUser.maVaiTro === 'ADMIN' || currentUser.maVaiTro === 'QUAN_LY';
    if (!isManager && item.nguoiDungId !== BigInt(currentUser.id)) {
      throw new UnauthorizedError('Bạn không có quyền xem bản ghi đăng ký này');
    }

    return serializeBigInt(formatRegistrationData(item));
  }

  /**
   * Đăng ký ca làm việc
   */
  async dangKy(data: unknown, currentUser: SessionUser) {
    const validated = validate(dangKyCaSchema, data) as DangKyCaInput;
    const caTheoNgayId = BigInt(validated.caLamViecTheoNgayId);
    const userId = BigInt(currentUser.id);

    // 1. Kiểm tra ca làm việc tồn tại và đang mở
    const caTheoNgay = await lichRepository.findById(caTheoNgayId);
    if (!caTheoNgay) {
      throw new NotFoundError('Không tìm thấy ca làm việc này');
    }

    if (caTheoNgay.trangThai !== 'MO') {
      throw new BusinessError('Ca làm việc này hiện không mở nhận đăng ký');
    }

    // 2. Kiểm tra kỳ đăng ký có đang trong thời gian mở không
    const ky = caTheoNgay.kyDangKyLich;
    if (ky.trangThai !== 'MO_DANG_KY') {
      throw new BusinessError(`Kỳ đăng ký "${ky.tenKy}" hiện không mở nhận đăng ký`);
    }

    const now = new Date();
    if (ky.thoiGianMoDangKy && now < ky.thoiGianMoDangKy) {
      throw new BusinessError(`Kỳ đăng ký chưa mở (bắt đầu từ ${ky.thoiGianMoDangKy.toLocaleString('vi-VN')})`);
    }
    if (ky.thoiGianDongDangKy && now > ky.thoiGianDongDangKy) {
      throw new BusinessError(`Kỳ đăng ký đã hết hạn (đóng lúc ${ky.thoiGianDongDangKy.toLocaleString('vi-VN')})`);
    }

    // 3. Kiểm tra xem người dùng đã đăng ký ca này chưa
    const existingRegistration = await dangKyCaRepository.findByUserAndShift(userId, caTheoNgayId);
    if (existingRegistration) {
      if (['DA_DUYET', 'CHO_DUYET'].includes(existingRegistration.trangThai)) {
        throw new ConflictError('Bạn đã đăng ký ca làm việc này rồi');
      }
    }

    // 4. Kiểm tra xung đột thời gian với các ca khác trong cùng ngày
    const existingDayShifts = await dangKyCaRepository.findUserApprovedRegistrationsOnDate(
      userId,
      caTheoNgay.ngayLamViec
    );

    const targetStart = caTheoNgay.gioBatDau.getTime();
    const targetEnd = caTheoNgay.gioKetThuc.getTime();

    for (const reg of existingDayShifts) {
      if (reg.caLamViecTheoNgayId === caTheoNgayId) continue;
      const otherStart = reg.caLamViecTheoNgay.gioBatDau.getTime();
      const otherEnd = reg.caLamViecTheoNgay.gioKetThuc.getTime();

      // Kiểm tra overlap
      if (targetStart < otherEnd && targetEnd > otherStart) {
        throw new BusinessError('Trùng thời gian với ca khác bạn đã đăng ký trong ngày hôm đó');
      }
    }

    // 5. Kiểm tra số lượng người tối đa
    const currentApprovedCount = await dangKyCaRepository.countApprovedByShift(caTheoNgayId);
    if (currentApprovedCount >= caTheoNgay.soNguoiToiDa) {
      throw new BusinessError('Ca làm việc này đã đủ số lượng người đăng ký');
    }

    // 6. Kiểm tra cấu hình tự động duyệt
    const autoApproveConfig = await prisma.cauHinhHeThong.findUnique({
      where: { maCauHinh: 'TU_DONG_DUYET_DANG_KY' },
    });
    const isAutoApprove = autoApproveConfig?.giaTri === 'true';

    let regResult;
    if (existingRegistration) {
      // Re-activate if was previously cancelled/rejected
      regResult = await dangKyCaRepository.update(existingRegistration.id, {
        trangThai: isAutoApprove ? 'DA_DUYET' : 'CHO_DUYET',
        thoiGianDangKy: new Date(),
        thoiGianDuyet: isAutoApprove ? new Date() : null,
        ghiChu: validated.ghiChu,
        lyDoTuChoi: null,
      });
    } else {
      regResult = await dangKyCaRepository.create({
        nguoiDung: { connect: { id: userId } },
        caLamViecTheoNgay: { connect: { id: caTheoNgayId } },
        trangThai: isAutoApprove ? 'DA_DUYET' : 'CHO_DUYET',
        thoiGianDangKy: new Date(),
        thoiGianDuyet: isAutoApprove ? new Date() : null,
        ghiChu: validated.ghiChu,
      });
    }

    // Gửi thông báo
    await thongBaoService.taoThongBao({
      nguoiDungId: currentUser.id,
      loaiThongBao: 'DANG_KY_THANH_CONG',
      tieuDe: 'Đăng ký ca thành công',
      noiDung: isAutoApprove
        ? `Đăng ký ca làm việc của bạn vào ngày ${caTheoNgay.ngayLamViec.toISOString().substring(0, 10)} đã được duyệt tự động.`
        : `Bạn đã gửi đăng ký ca làm việc vào ngày ${caTheoNgay.ngayLamViec.toISOString().substring(0, 10)}. Vui lòng đợi quản lý phê duyệt.`,
      loaiDoiTuongThamChieu: 'DANG_KY_CA',
      doiTuongThamChieuId: regResult.id,
    });

    await nhatKyService.ghiNhatKy({
      nguoiDungId: currentUser.id,
      hanhDong: 'DANG_KY_CA',
      loaiDoiTuong: 'DANG_KY_CA',
      doiTuongId: regResult.id,
      duLieuMoi: regResult,
    });

    return serializeBigInt(formatRegistrationData(regResult));
  }

  /**
   * Quản lý duyệt đăng ký ca
   */
  async duyet(id: string, data: unknown, currentUser: SessionUser) {
    const validated = validate(duyetDangKySchema, data) as DuyetDangKyInput;
    const numId = BigInt(id);

    const reg = await dangKyCaRepository.findById(numId);
    if (!reg) {
      throw new NotFoundError('Không tìm thấy bản ghi đăng ký ca');
    }

    if (reg.trangThai === 'DA_DUYET') {
      throw new BusinessError('Đăng ký ca này đã được duyệt trước đó');
    }

    // Kiểm tra giới hạn ca
    const currentApprovedCount = await dangKyCaRepository.countApprovedByShift(
      reg.caLamViecTheoNgayId
    );
    if (currentApprovedCount >= reg.caLamViecTheoNgay.soNguoiToiDa) {
      throw new BusinessError('Ca làm việc này đã đủ số lượng người đăng ký');
    }

    const updated = await dangKyCaRepository.update(numId, {
      trangThai: 'DA_DUYET',
      thoiGianDuyet: new Date(),
      nguoiDuyet: { connect: { id: BigInt(currentUser.id) } },
      ...(validated.ghiChu && { ghiChu: validated.ghiChu }),
    });

    // Thông báo cho nhân viên
    await thongBaoService.taoThongBao({
      nguoiDungId: reg.nguoiDungId,
      loaiThongBao: 'DANG_KY_DUOC_DUYET',
      tieuDe: 'Đăng ký ca đã được duyệt',
      noiDung: `Đăng ký ca làm việc ngày ${reg.caLamViecTheoNgay.ngayLamViec.toISOString().substring(0, 10)} của bạn đã được duyệt bởi ${currentUser.hoTen}.`,
      loaiDoiTuongThamChieu: 'DANG_KY_CA',
      doiTuongThamChieuId: numId,
    });

    await nhatKyService.ghiNhatKy({
      nguoiDungId: currentUser.id,
      hanhDong: 'DUYET',
      loaiDoiTuong: 'DANG_KY_CA',
      doiTuongId: numId,
      duLieuCu: reg,
      duLieuMoi: updated,
    });

    return serializeBigInt(formatRegistrationData(updated));
  }

  /**
   * Quản lý từ chối đăng ký ca
   */
  async tuChoi(id: string, data: unknown, currentUser: SessionUser) {
    const validated = validate(tuChoiDangKySchema, data) as TuChoiDangKyInput;
    const numId = BigInt(id);

    const reg = await dangKyCaRepository.findById(numId);
    if (!reg) {
      throw new NotFoundError('Không tìm thấy bản ghi đăng ký ca');
    }

    const updated = await dangKyCaRepository.update(numId, {
      trangThai: 'TU_CHOI',
      thoiGianTuChoi: new Date(),
      lyDoTuChoi: validated.lyDoTuChoi,
      nguoiTuChoi: { connect: { id: BigInt(currentUser.id) } },
    });

    // Thông báo cho nhân viên
    await thongBaoService.taoThongBao({
      nguoiDungId: reg.nguoiDungId,
      loaiThongBao: 'DANG_KY_BI_TU_CHOI',
      tieuDe: 'Đăng ký ca bị từ chối',
      noiDung: `Đăng ký ca ngày ${reg.caLamViecTheoNgay.ngayLamViec.toISOString().substring(0, 10)} đã bị từ chối. Lý do: ${validated.lyDoTuChoi}`,
      loaiDoiTuongThamChieu: 'DANG_KY_CA',
      doiTuongThamChieuId: numId,
    });

    await nhatKyService.ghiNhatKy({
      nguoiDungId: currentUser.id,
      hanhDong: 'TU_CHOI',
      loaiDoiTuong: 'DANG_KY_CA',
      doiTuongId: numId,
      duLieuCu: reg,
      duLieuMoi: updated,
    });

    return serializeBigInt(formatRegistrationData(updated));
  }

  /**
   * Hủy đăng ký ca (nhân viên tự hủy hoặc quản lý hủy)
   */
  async huy(id: string, currentUser: SessionUser) {
    const numId = BigInt(id);
    const reg = await dangKyCaRepository.findById(numId);
    if (!reg) {
      throw new NotFoundError('Không tìm thấy bản ghi đăng ký ca');
    }

    const isManager = currentUser.maVaiTro === 'ADMIN' || currentUser.maVaiTro === 'QUAN_LY';
    if (!isManager && reg.nguoiDungId !== BigInt(currentUser.id)) {
      throw new UnauthorizedError('Bạn không có quyền hủy đăng ký của người khác');
    }

    if (reg.trangThai === 'DA_HUY') {
      throw new BusinessError('Đăng ký ca này đã được hủy trước đó');
    }

    // Nếu nhân viên tự hủy ca đã duyệt, kiểm tra giới hạn giờ hủy trước ca
    if (!isManager && reg.trangThai === 'DA_DUYET') {
      const config = await prisma.cauHinhHeThong.findUnique({
        where: { maCauHinh: 'THOI_GIAN_HUY_TRUOC_GIO' },
      });
      const hoursBefore = config?.giaTri ? parseInt(config.giaTri, 10) : 24;

      const shiftDate = new Date(reg.caLamViecTheoNgay.ngayLamViec);
      const shiftStartTime = reg.caLamViecTheoNgay.gioBatDau;

      const shiftDateTime = new Date(
        shiftDate.getUTCFullYear(),
        shiftDate.getUTCMonth(),
        shiftDate.getUTCDate(),
        shiftStartTime.getUTCHours(),
        shiftStartTime.getUTCMinutes()
      );

      const cutoffTime = new Date(shiftDateTime.getTime() - hoursBefore * 60 * 60 * 1000);
      if (new Date() > cutoffTime) {
        throw new BusinessError(
          `Chỉ được phép hủy ca trước ${hoursBefore} giờ. Hiện tại đã quá hạn tự hủy, vui lòng gửi yêu cầu thay đổi lịch.`
        );
      }
    }

    const updated = await dangKyCaRepository.update(numId, {
      trangThai: 'DA_HUY',
    });

    await nhatKyService.ghiNhatKy({
      nguoiDungId: currentUser.id,
      hanhDong: 'HUY_DANG_KY',
      loaiDoiTuong: 'DANG_KY_CA',
      doiTuongId: numId,
      duLieuCu: reg,
      duLieuMoi: updated,
    });

    return serializeBigInt(formatRegistrationData(updated));
  }
}

export const dangKyCaService = new DangKyCaService();
