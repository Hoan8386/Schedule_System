// =========================================================
// Validator - Thông báo & Cấu hình / Mẫu thông báo
// =========================================================

import { z } from 'zod';

export const danhDauDocSchema = z.object({
  thongBaoIds: z
    .array(z.string())
    .min(1, 'Phải chọn ít nhất 1 thông báo')
    .optional(),
});

export const capNhatCauHinhThongBaoSchema = z.object({
  bat: z.boolean({ required_error: 'Trạng thái bật/tắt là bắt buộc' }),
});

export const taoMauThongBaoSchema = z.object({
  kenh: z.string({ required_error: 'Kênh là bắt buộc' }).max(20),
  loaiSuKien: z.string({ required_error: 'Loại sự kiện là bắt buộc' }).max(50),
  tieuDe: z.string().max(255).optional().nullable(),
  noiDung: z.string({ required_error: 'Nội dung là bắt buộc' }).min(1),
  dangHoatDong: z.boolean().optional().default(true),
});

export const capNhatMauThongBaoSchema = z.object({
  tieuDe: z.string().max(255).optional().nullable(),
  noiDung: z.string().min(1).optional(),
  dangHoatDong: z.boolean().optional(),
});

export type DanhDauDocInput = z.infer<typeof danhDauDocSchema>;
export type CapNhatCauHinhThongBaoInput = z.infer<typeof capNhatCauHinhThongBaoSchema>;
export type TaoMauThongBaoInput = z.infer<typeof taoMauThongBaoSchema>;
export type CapNhatMauThongBaoInput = z.infer<typeof capNhatMauThongBaoSchema>;
