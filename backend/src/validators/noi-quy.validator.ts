// =========================================================
// Validator - Nội quy lịch
// =========================================================

import { z } from 'zod';
import { TrangThaiNoiQuy } from '@/types/enums';

export const taoNoiQuySchema = z.object({
  kyDangKyLichId: z.string().optional().nullable(),
  tieuDe: z
    .string({ required_error: 'Tiêu đề là bắt buộc' })
    .min(1, 'Tiêu đề không được để trống')
    .max(255, 'Tiêu đề tối đa 255 ký tự'),
  noiDung: z
    .string({ required_error: 'Nội dung là bắt buộc' })
    .min(1, 'Nội dung không được để trống'),
  trangThai: z.nativeEnum(TrangThaiNoiQuy).optional().default(TrangThaiNoiQuy.HOAT_DONG),
});

export const capNhatNoiQuySchema = z.object({
  tieuDe: z.string().min(1).max(255).optional(),
  noiDung: z.string().min(1).optional(),
  trangThai: z.nativeEnum(TrangThaiNoiQuy).optional(),
});

export type TaoNoiQuyInput = z.infer<typeof taoNoiQuySchema>;
export type CapNhatNoiQuyInput = z.infer<typeof capNhatNoiQuySchema>;
