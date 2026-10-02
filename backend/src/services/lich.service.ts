// =========================================================
// Service - Ca làm việc theo ngày (Lịch)
// =========================================================

import prisma from '@/lib/prisma';
import { lichRepository } from '@/repositories/lich.repository';
import { caLamViecRepository } from '@/repositories/ca-lam-viec.repository';
import { kyDangKyRepository } from '@/repositories/ky-dang-ky.repository';
import { nhatKyService } from '@/services/nhat-ky.service';
import { NotFoundError, ConflictError, BusinessError } from '@/lib/errors';
import { calculateSkip, calculatePaginationMeta, serializeBigInt } from '@/lib/utils';
import { validate } from '@/middleware/validation.middleware';
import {
  taoCaTheoNgaySchema,
  taoCaTheoNgayBatchSchema,
  capNhatCaTheoNgaySchema,
} from '@/validators/lich.validator';
import type {
  TaoCaTheoNgayInput,
  TaoCaTheoNgayBatchInput,
  CapNhatCaTheoNgayInput,
} from '@/validators/lich.validator';
import type { PaginationQuery, PaginatedResult, SessionUser } from '@/types';
import type { Prisma } from '@prisma/client';

function formatDailyShift(shift: unknown): unknown {
  if (!shift || typeof shift !== 'object') return shift;
  const s = { ...(shift as Record<string, unknown>) };
  if (s.ngayLamViec instanceof Date) {
    s.ngayLamViec = s.ngayLamViec.toISOString().substring(0, 10);
  }
  if (s.gioBatDau instanceof Date) {
    s.gioBatDau = s.gioBatDau.toISOString().substring(11, 16);
  }
  if (s.gioKetThuc instanceof Date) {
    s.gioKetThuc = s.gioKetThuc.toISOString().substring(11, 16);
  }
  if (s.caLamViec && typeof s.caLamViec === 'object') {
    const clv = { ...(s.caLamViec as Record<string, unknown>) };
    if (clv.gioBatDau instanceof Date) {
      clv.gioBatDau = clv.gioBatDau.toISOString().substring(11, 16);
    }
    if (clv.gioKetThuc instanceof Date) {
      clv.gioKetThuc = clv.gioKetThuc.toISOString().substring(11, 16);
    }
    s.caLamViec = clv;
  }
  return s;
}

export class LichService {
  /**
   * Lấy danh sách lịch ca theo ngày
   */
  async getAll(
    query: PaginationQuery & {
      kyDangKyLichId?: string;
      caLamViecId?: string;
      tuNgay?: string;
      denNgay?: string;
      trangThai?: string;
    }
  ): Promise<PaginatedResult<unknown>> {
    const page = query.page || 1;
    const limit = query.limit || 100;
    const skip = calculateSkip(page, limit);

    const where: Prisma.CaLamViecTheoNgayWhereInput = {};

    if (query.kyDangKyLichId) {
      where.kyDangKyLichId = BigInt(query.kyDangKyLichId);
    }
    if (query.caLamViecId) {
      where.caLamViecId = BigInt(query.caLamViecId);
    }
    if (query.trangThai) {
      where.trangThai = query.trangThai;
    }

    if (query.tuNgay || query.denNgay) {
      where.ngayLamViec = {};
      if (query.tuNgay) {
        where.ngayLamViec.gte = new Date(query.tuNgay);
      }
      if (query.denNgay) {
        where.ngayLamViec.lte = new Date(query.denNgay);
      }
    }

    const [data, total] = await Promise.all([
      lichRepository.findMany({ skip, take: limit, where }),
      lichRepository.count(where),
    ]);

    const formatted = data.map((d) => formatDailyShift(d));

    return {
      data: serializeBigInt(formatted),
      meta: calculatePaginationMeta(total, page, limit),
    };
  }

  /**
   * Lấy chi tiết ca theo ngày theo ID
   */
  async getById(id: string) {
    const item = await lichRepository.findById(BigInt(id));
    if (!item) {
      throw new NotFoundError('Không tìm thấy ca làm việc này');
    }
    return serializeBigInt(formatDailyShift(item));
  }

  /**
   * Tạo ca làm việc đơn lẻ theo ngày
   */
  async create(data: unknown, currentUser: SessionUser) {
    const validated = validate(taoCaTheoNgaySchema, data) as TaoCaTheoNgayInput;

    const [ky, templateCa] = await Promise.all([
      kyDangKyRepository.findById(BigInt(validated.kyDangKyLichId)),
      caLamViecRepository.findById(BigInt(validated.caLamViecId)),
    ]);

    if (!ky) throw new NotFoundError('Kỳ đăng ký không tồn tại');
    if (!templateCa) throw new NotFoundError('Mẫu ca làm việc không tồn tại');

    const ngayDate = new Date(validated.ngayLamViec);
    const existing = await lichRepository.findByCaAndDate(templateCa.id, ngayDate);
    if (existing) {
      throw new ConflictError(
        `Ca "${templateCa.tenCa}" đã được lên lịch cho ngày ${validated.ngayLamViec}`
      );
    }

    const item = await lichRepository.create({
      kyDangKyLich: { connect: { id: ky.id } },
      caLamViec: { connect: { id: templateCa.id } },
      ngayLamViec: ngayDate,
      gioBatDau: validated.gioBatDau ? new Date(`1970-01-01T${validated.gioBatDau}:00Z`) : templateCa.gioBatDau,
      gioKetThuc: validated.gioKetThuc ? new Date(`1970-01-01T${validated.gioKetThuc}:00Z`) : templateCa.gioKetThuc,
      soNguoiToiDa: validated.soNguoiToiDa ?? templateCa.soNguoiToiDa,
      trangThai: validated.trangThai || 'MO',
    });

    await nhatKyService.ghiNhatKy({
      nguoiDungId: currentUser.id,
      hanhDong: 'TAO',
      loaiDoiTuong: 'CA_THEO_NGAY',
      doiTuongId: item.id,
      duLieuMoi: item,
    });

    return serializeBigInt(formatDailyShift(item));
  }

  /**
   * Tạo hàng loạt ca theo khoảng ngày (Batch Generate)
   */
  async createBatch(data: unknown, currentUser: SessionUser) {
    const validated = validate(taoCaTheoNgayBatchSchema, data) as TaoCaTheoNgayBatchInput;

    const ky = await kyDangKyRepository.findById(BigInt(validated.kyDangKyLichId));
    if (!ky) throw new NotFoundError('Kỳ đăng ký không tồn tại');

    const templates = await prisma.caLamViec.findMany({
      where: {
        id: { in: validated.caLamViecIds.map((id) => BigInt(id)) },
        trangThai: 'HOAT_DONG',
      },
    });

    if (templates.length === 0) {
      throw new BusinessError('Không tìm thấy ca làm việc hoạt động nào được chọn');
    }

    // Lấy danh sách ngày lễ nếu cần bỏ qua
    let holidayDates: Set<string> = new Set();
    if (validated.boQuaNgayLe) {
      const holidays = await prisma.ngayLe.findMany({
        where: {
          dangHoatDong: true,
          ngay: {
            gte: new Date(validated.tuNgay),
            lte: new Date(validated.denNgay),
          },
        },
      });
      holidayDates = new Set(
        holidays.map((h) => h.ngay.toISOString().substring(0, 10))
      );
    }

    // Tạo các bản ghi ca
    const shiftsToCreate: Prisma.CaLamViecTheoNgayCreateManyInput[] = [];
    const currentDate = new Date(validated.tuNgay);
    const endDate = new Date(validated.denNgay);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().substring(0, 10);
      const dayOfWeek = currentDate.getUTCDay(); // 0: Sun, 6: Sat

      const isSunday = dayOfWeek === 0;
      const isSaturday = dayOfWeek === 6;
      const isHoliday = holidayDates.has(dateStr);

      const skip =
        (validated.boQuaChuNhat && isSunday) ||
        (validated.boQuaThuBay && isSaturday) ||
        (validated.boQuaNgayLe && isHoliday);

      if (!skip) {
        for (const tmpl of templates) {
          shiftsToCreate.push({
            kyDangKyLichId: ky.id,
            caLamViecId: tmpl.id,
            ngayLamViec: new Date(dateStr),
            gioBatDau: tmpl.gioBatDau,
            gioKetThuc: tmpl.gioKetThuc,
            soNguoiToiDa: tmpl.soNguoiToiDa,
            trangThai: 'MO',
          });
        }
      }

      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    if (shiftsToCreate.length === 0) {
      return { count: 0, message: 'Không có ca làm việc nào cần tạo theo tiêu chí đã chọn' };
    }

    const result = await lichRepository.createMany(shiftsToCreate);

    await nhatKyService.ghiNhatKy({
      nguoiDungId: currentUser.id,
      hanhDong: 'TAO_HANG_LOAT',
      loaiDoiTuong: 'CA_THEO_NGAY',
      doiTuongId: ky.id,
      duLieuMoi: { soLuongTao: result.count, tuNgay: validated.tuNgay, denNgay: validated.denNgay },
    });

    return {
      count: result.count,
      message: `Đã tạo thành công ${result.count} ca làm việc theo ngày`,
    };
  }

  /**
   * Cập nhật ca theo ngày
   */
  async update(id: string, data: unknown, currentUser: SessionUser) {
    const validated = validate(capNhatCaTheoNgaySchema, data) as CapNhatCaTheoNgayInput;
    const numId = BigInt(id);

    const existing = await lichRepository.findById(numId);
    if (!existing) {
      throw new NotFoundError('Không tìm thấy ca làm việc');
    }

    const updated = await lichRepository.update(numId, validated);

    await nhatKyService.ghiNhatKy({
      nguoiDungId: currentUser.id,
      hanhDong: 'CAP_NHAT',
      loaiDoiTuong: 'CA_THEO_NGAY',
      doiTuongId: numId,
      duLieuCu: existing,
      duLieuMoi: updated,
    });

    return serializeBigInt(formatDailyShift(updated));
  }

  /**
   * Xóa ca theo ngày
   */
  async delete(id: string, currentUser: SessionUser) {
    const numId = BigInt(id);
    const existing = await lichRepository.findById(numId);
    if (!existing) {
      throw new NotFoundError('Không tìm thấy ca làm việc');
    }

    if (existing.dangKyCas.length > 0) {
      throw new BusinessError(
        `Không thể xóa ca làm việc này vì đã có ${existing.dangKyCas.length} lượt đăng ký. Hãy hủy đăng ký trước.`
      );
    }

    const deleted = await lichRepository.delete(numId);

    await nhatKyService.ghiNhatKy({
      nguoiDungId: currentUser.id,
      hanhDong: 'XOA',
      loaiDoiTuong: 'CA_THEO_NGAY',
      doiTuongId: numId,
      duLieuCu: existing,
    });

    return serializeBigInt(formatDailyShift(deleted));
  }
}

export const lichService = new LichService();
