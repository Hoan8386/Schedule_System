// =========================================================
// Validator - Ngày lễ
// =========================================================

import { z } from 'zod';

export const taoNgayLeSchema = z.object({
  tenNgayLe: z
    .string({ required_error: 'Tên ngày lễ là bắt buộc' })
    .min(1, 'Tên ngày lễ không được để trống')
    .max(255, 'Tên ngày lễ tối đa 255 ký tự'),
  ngay: z
    .string({ required_error: 'Ngày là bắt buộc' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày phải có định dạng YYYY-MM-DD'),
  moTa: z.string().max(5000).optional().nullable(),
  dangHoatDong: z.boolean().optional().default(true),
});

export const capNhatNgayLeSchema = z.object({
  tenNgayLe: z.string().min(1).max(255).optional(),
  ngay: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  moTa: z.string().max(5000).optional().nullable(),
  dangHoatDong: z.boolean().optional(),
});

export type TaoNgayLeInput = z.infer<typeof taoNgayLeSchema>;
export type CapNhatNgayLeInput = z.infer<typeof capNhatNgayLeSchema>;
