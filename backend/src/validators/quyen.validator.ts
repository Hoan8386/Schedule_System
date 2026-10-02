// =========================================================
// Validator - Quyền
// =========================================================

import { z } from 'zod';

const httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] as const;

/** Schema tạo quyền */
export const taoQuyenSchema = z.object({
  maQuyen: z
    .string({ required_error: 'Mã quyền là bắt buộc' })
    .min(1, 'Mã quyền không được để trống')
    .max(100, 'Mã quyền tối đa 100 ký tự')
    .regex(/^[A-Z0-9_]+$/, 'Mã quyền chỉ chứa chữ in hoa, số và dấu gạch dưới'),
  tenQuyen: z
    .string({ required_error: 'Tên quyền là bắt buộc' })
    .min(1, 'Tên quyền không được để trống')
    .max(150, 'Tên quyền tối đa 150 ký tự'),
  apiPath: z
    .string({ required_error: 'API path là bắt buộc' })
    .min(1, 'API path không được để trống')
    .max(255, 'API path tối đa 255 ký tự')
    .startsWith('/api/', 'API path phải bắt đầu bằng /api/'),
  httpMethod: z.enum(httpMethods, {
    errorMap: () => ({ message: `HTTP method phải là một trong: ${httpMethods.join(', ')}` }),
  }),
  moTa: z.string().max(5000, 'Mô tả tối đa 5000 ký tự').optional().nullable(),
  dangHoatDong: z.boolean().optional().default(true),
});

/** Schema cập nhật quyền */
export const capNhatQuyenSchema = z.object({
  tenQuyen: z.string().min(1).max(150).optional(),
  apiPath: z.string().min(1).max(255).startsWith('/api/').optional(),
  httpMethod: z.enum(httpMethods).optional(),
  moTa: z.string().max(5000).optional().nullable(),
  dangHoatDong: z.boolean().optional(),
});

export type TaoQuyenInput = z.infer<typeof taoQuyenSchema>;
export type CapNhatQuyenInput = z.infer<typeof capNhatQuyenSchema>;
