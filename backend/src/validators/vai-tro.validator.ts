// =========================================================
// Validator - Vai trò
// =========================================================

import { z } from 'zod';

/** Schema tạo vai trò */
export const taoVaiTroSchema = z.object({
  maVaiTro: z
    .string({ required_error: 'Mã vai trò là bắt buộc' })
    .min(1, 'Mã vai trò không được để trống')
    .max(50, 'Mã vai trò tối đa 50 ký tự')
    .regex(/^[A-Z0-9_]+$/, 'Mã vai trò chỉ chứa chữ in hoa, số và dấu gạch dưới'),
  tenVaiTro: z
    .string({ required_error: 'Tên vai trò là bắt buộc' })
    .min(1, 'Tên vai trò không được để trống')
    .max(100, 'Tên vai trò tối đa 100 ký tự'),
  moTa: z.string().max(5000, 'Mô tả tối đa 5000 ký tự').optional().nullable(),
  dangHoatDong: z.boolean().optional().default(true),
});

/** Schema cập nhật vai trò */
export const capNhatVaiTroSchema = z.object({
  tenVaiTro: z
    .string()
    .min(1, 'Tên vai trò không được để trống')
    .max(100, 'Tên vai trò tối đa 100 ký tự')
    .optional(),
  moTa: z.string().max(5000, 'Mô tả tối đa 5000 ký tự').optional().nullable(),
  dangHoatDong: z.boolean().optional(),
});

/** Schema gán quyền cho vai trò */
export const ganQuyenSchema = z.object({
  quyenIds: z
    .array(z.string({ required_error: 'ID quyền là bắt buộc' }))
    .min(1, 'Phải chọn ít nhất 1 quyền'),
});

export type TaoVaiTroInput = z.infer<typeof taoVaiTroSchema>;
export type CapNhatVaiTroInput = z.infer<typeof capNhatVaiTroSchema>;
export type GanQuyenInput = z.infer<typeof ganQuyenSchema>;
