// =========================================================
// Validator - Kỳ đăng ký lịch
// =========================================================

import { z } from 'zod';
import { TrangThaiKyDangKy } from '@/types/enums';

/** Schema tạo kỳ đăng ký */
export const taoKyDangKySchema = z.object({
  tenKy: z
    .string({ required_error: 'Tên kỳ là bắt buộc' })
    .min(1, 'Tên kỳ không được để trống')
    .max(100, 'Tên kỳ tối đa 100 ký tự'),
  nam: z
    .number({ required_error: 'Năm là bắt buộc' })
    .int()
    .min(2000, 'Năm phải từ 2000'),
  thang: z
    .number({ required_error: 'Tháng là bắt buộc' })
    .int()
    .min(1, 'Tháng phải từ 1')
    .max(12, 'Tháng tối đa 12'),
  thoiGianMoDangKy: z.string().datetime({ message: 'Thời gian mở đăng ký không hợp lệ' }).optional().nullable(),
  thoiGianDongDangKy: z.string().datetime({ message: 'Thời gian đóng đăng ký không hợp lệ' }).optional().nullable(),
  thoiGianChotLich: z.string().datetime({ message: 'Thời gian chốt lịch không hợp lệ' }).optional().nullable(),
  trangThai: z
    .nativeEnum(TrangThaiKyDangKy, { errorMap: () => ({ message: 'Trạng thái không hợp lệ' }) })
    .optional()
    .default(TrangThaiKyDangKy.NHAP),
});

/** Schema cập nhật kỳ đăng ký */
export const capNhatKyDangKySchema = z.object({
  tenKy: z.string().min(1).max(100).optional(),
  thoiGianMoDangKy: z.string().datetime().optional().nullable(),
  thoiGianDongDangKy: z.string().datetime().optional().nullable(),
  thoiGianChotLich: z.string().datetime().optional().nullable(),
  trangThai: z.nativeEnum(TrangThaiKyDangKy).optional(),
});

export type TaoKyDangKyInput = z.infer<typeof taoKyDangKySchema>;
export type CapNhatKyDangKyInput = z.infer<typeof capNhatKyDangKySchema>;
