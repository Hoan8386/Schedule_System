// =========================================================
// Validator - Ca làm việc
// =========================================================

import { z } from 'zod';
import { TrangThaiCaLamViec } from '@/types/enums';

/** Schema tạo ca làm việc */
export const taoCaLamViecSchema = z.object({
  maCa: z
    .string({ required_error: 'Mã ca là bắt buộc' })
    .min(1, 'Mã ca không được để trống')
    .max(50, 'Mã ca tối đa 50 ký tự'),
  tenCa: z
    .string({ required_error: 'Tên ca là bắt buộc' })
    .min(1, 'Tên ca không được để trống')
    .max(100, 'Tên ca tối đa 100 ký tự'),
  gioBatDau: z
    .string({ required_error: 'Giờ bắt đầu là bắt buộc' })
    .regex(/^\d{2}:\d{2}$/, 'Giờ bắt đầu phải có định dạng HH:mm'),
  gioKetThuc: z
    .string({ required_error: 'Giờ kết thúc là bắt buộc' })
    .regex(/^\d{2}:\d{2}$/, 'Giờ kết thúc phải có định dạng HH:mm'),
  soNguoiToiDa: z
    .number({ required_error: 'Số người tối đa là bắt buộc' })
    .int('Số người tối đa phải là số nguyên')
    .min(1, 'Số người tối đa phải lớn hơn 0'),
  thuTuHienThi: z.number().int().min(0).optional().default(0),
  trangThai: z
    .nativeEnum(TrangThaiCaLamViec, { errorMap: () => ({ message: 'Trạng thái không hợp lệ' }) })
    .optional()
    .default(TrangThaiCaLamViec.HOAT_DONG),
}).refine(
  (data) => data.gioKetThuc > data.gioBatDau,
  { message: 'Giờ kết thúc phải lớn hơn giờ bắt đầu', path: ['gioKetThuc'] }
);

/** Schema cập nhật ca làm việc */
export const capNhatCaLamViecSchema = z.object({
  tenCa: z.string().min(1).max(100).optional(),
  gioBatDau: z.string().regex(/^\d{2}:\d{2}$/, 'Giờ bắt đầu phải có định dạng HH:mm').optional(),
  gioKetThuc: z.string().regex(/^\d{2}:\d{2}$/, 'Giờ kết thúc phải có định dạng HH:mm').optional(),
  soNguoiToiDa: z.number().int().min(1).optional(),
  thuTuHienThi: z.number().int().min(0).optional(),
  trangThai: z.nativeEnum(TrangThaiCaLamViec).optional(),
});

export type TaoCaLamViecInput = z.infer<typeof taoCaLamViecSchema>;
export type CapNhatCaLamViecInput = z.infer<typeof capNhatCaLamViecSchema>;
