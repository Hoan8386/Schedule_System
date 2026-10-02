// =========================================================
// Validator - Quy tắc lịch
// =========================================================

import { z } from 'zod';

export const taoQuyTacSchema = z.object({
  kyDangKyLichId: z.string().optional().nullable(),
  maQuyTac: z
    .string({ required_error: 'Mã quy tắc là bắt buộc' })
    .min(1, 'Mã quy tắc không được để trống')
    .max(100, 'Mã quy tắc tối đa 100 ký tự'),
  giaTri: z
    .string({ required_error: 'Giá trị là bắt buộc' })
    .min(1, 'Giá trị không được để trống')
    .max(500, 'Giá trị tối đa 500 ký tự'),
  moTa: z.string().max(5000).optional().nullable(),
  dangHoatDong: z.boolean().optional().default(true),
});

export const capNhatQuyTacSchema = z.object({
  giaTri: z.string().min(1).max(500).optional(),
  moTa: z.string().max(5000).optional().nullable(),
  dangHoatDong: z.boolean().optional(),
});

export type TaoQuyTacInput = z.infer<typeof taoQuyTacSchema>;
export type CapNhatQuyTacInput = z.infer<typeof capNhatQuyTacSchema>;
