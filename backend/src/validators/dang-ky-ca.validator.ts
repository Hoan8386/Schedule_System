// =========================================================
// Validator - Đăng ký ca
// =========================================================

import { z } from 'zod';

/** Schema đăng ký ca */
export const dangKyCaSchema = z.object({
  caLamViecTheoNgayId: z
    .string({ required_error: 'ID ca làm việc theo ngày là bắt buộc' }),
  ghiChu: z.string().max(5000, 'Ghi chú tối đa 5000 ký tự').optional().nullable(),
});

/** Schema duyệt đăng ký */
export const duyetDangKySchema = z.object({
  ghiChu: z.string().max(5000).optional().nullable(),
});

/** Schema từ chối đăng ký */
export const tuChoiDangKySchema = z.object({
  lyDoTuChoi: z
    .string({ required_error: 'Lý do từ chối là bắt buộc' })
    .min(1, 'Lý do từ chối không được để trống')
    .max(5000, 'Lý do từ chối tối đa 5000 ký tự'),
});

export type DangKyCaInput = z.infer<typeof dangKyCaSchema>;
export type DuyetDangKyInput = z.infer<typeof duyetDangKySchema>;
export type TuChoiDangKyInput = z.infer<typeof tuChoiDangKySchema>;
